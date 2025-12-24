import { prisma } from '../lib/prisma.js';
import { AuthService } from '../lib/auth.js';
import { emailService } from '../lib/email.js';
import { DashboardService } from '../lib/dashboard.js';
import createDOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);

export const resolvers = {
  Query: {
    // User queries
    me: (_: any, __: any, { user }: any) => user,
    users: () => prisma.user.findMany(),

    // Project queries
    projects: async () => {
      const projects = await prisma.project.findMany({
        include: {
          user: true
        }
      });
      return projects;
    },
    project: async (_: any, { id }: { id: string }) => {
      const idInt = parseInt(id, 10);
      if (isNaN(idInt)) {
        return null;
      }
      const project = await prisma.project.findUnique({
        where: { id: idInt },
        include: {
          user: true
        }
      });
      if (!project) {
        return null;
      }
      return project;
    },
    projectsByCategory: async (_: any, { category }: { category: string }) => {
      const projects = await prisma.project.findMany({
        where: { category },
        include: {
          user: true
        }
      });
      return projects;
    },

    // Dashboard queries
    dashboardStats: () => DashboardService.getStats(),
    analyticsStats: () => DashboardService.getAnalyticsStats(),
    conversations: (_: any, { limit, offset }: { limit?: number; offset?: number }) => DashboardService.getConversations(limit, offset),
    conversation: (_: any, { id }: { id: string }) => DashboardService.getConversationById(id),
    allOrders: (_: any, { limit, offset, status, date }: { limit?: number; offset?: number; status?: string; date?: string }) => DashboardService.getAllOrders(limit, offset, status, date),
    allAppointments: (_: any, { limit, offset, status, date }: { limit?: number; offset?: number; status?: string; date?: string }) => DashboardService.getAllAppointments(limit, offset, status, date),
  },

  Mutation: {
    // Auth mutations
    login: async (_: any, { email, password }: { email: string; password: string }, context: any) => {
      const ip = context.req.ip || context.req.connection.remoteAddress;
      const user = await AuthService.authenticateUser(email, password, ip);
      if (!user) throw new Error('Invalid credentials or IP blocked');

      const token = AuthService.generateToken(user);
      return { token, user };
    },

    register: async (_: any, { email, password, name }: { email: string; password: string; name?: string }) => {
      const user = await AuthService.registerUser(email, password, name);
      if (!user) throw new Error('Registration failed');

      const token = AuthService.generateToken(user);
      return { token, user };
    },

    createAdminUser: () => AuthService.createAdminUser(),

    createConversation: async () => {
      try {
        const conversation = await prisma.conversation.create({
          data: {
            userId: null,
            userName: null,
          },
        });
        return conversation;
      } catch (error) {
        throw new Error('Failed to create conversation');
      }
    },

    updateConversation: async (_: any, { conversationId, clientName, clientEmail, clientPhone }: { conversationId: string; clientName?: string; clientEmail?: string; clientPhone?: string }) => {
      try {
        const conversation = await prisma.conversation.update({
          where: { id: conversationId },
          data: {
            clientName,
            clientEmail,
            clientPhone
          }
        });
        return conversation;
      } catch (error) {
        throw new Error('Failed to update conversation');
      }
    },

    createAppointment: async (_: any, { service, date, time, conversationId }: { service: string; date: string; time: string; conversationId: string }) => {
      try {

        // Retrieve client info from conversation
        const conversation = await prisma.conversation.findUnique({
          where: { id: conversationId }
        });

        const clientName = conversation?.clientName || 'Inconnu';
        const clientEmail = conversation?.clientEmail || '';
        const clientPhone = conversation?.clientPhone || '';

        // Create appointment in DB
        // Parse the date string properly
        let appointmentDate: Date;
        try {
          appointmentDate = new Date(date);
          if (isNaN(appointmentDate.getTime())) {
            throw new Error('Invalid date format');
          }
        } catch (error) {
          throw new Error('Invalid date format. Please provide a valid date.');
        }

        const appointment = await prisma.appointment.create({
          data: {
            service,
            date: appointmentDate,
            time,
            clientName,
            status: 'pending',
            conversationId
          }
        });

        // Send email notification
        if (clientEmail) {
          await emailService.sendAppointmentNotification({
            service,
            date,
            time,
            clientName,
            clientEmail,
            clientPhone
          });
        }

        return appointment;
      } catch (error) {
        throw new Error('Failed to create appointment');
      }
    },

    createOrder: async (_: any, { service, details, conversationId }: { service: string; details: string; conversationId: string }) => {
      try {

        // Retrieve client info from conversation
        const conversation = await prisma.conversation.findUnique({
          where: { id: conversationId }
        });

        const clientName = conversation?.clientName || 'Inconnu';
        const clientEmail = conversation?.clientEmail || '';
        const clientPhone = conversation?.clientPhone || '';

        // Create order in DB
        const order = await prisma.order.create({
          data: {
            type: service,
            clientName,
            status: 'pending',
            conversationId
          }
        });

        // Send email notification
        if (clientEmail) {
          await emailService.sendOrderNotification({
            service,
            details,
            clientName,
            clientEmail,
            clientPhone
          });
        }

        return order;
      } catch (error) {
        throw new Error('Failed to create order');
      }
    },

    // Contact mutations
    sendContactMessage: async (_: any, {
      name,
      email,
      company,
      service,
      message
    }: {
      name: string;
      email: string;
      company?: string;
      service?: string;
      message: string;
    }) => {
      try {
        const sanitizedName = DOMPurify.sanitize(name);
        const sanitizedCompany = company ? DOMPurify.sanitize(company) : company;
        const sanitizedService = service ? DOMPurify.sanitize(service) : service;
        const sanitizedMessage = DOMPurify.sanitize(message);

        // Send notification email
        const notificationSent = await emailService.sendContactNotification({
          name: sanitizedName,
          email,
          company: sanitizedCompany,
          service: sanitizedService,
          message: sanitizedMessage
        });

        // Send auto-reply
        const autoReplySent = await emailService.sendAutoReply({
          name: sanitizedName,
          email,
          company: sanitizedCompany,
          service: sanitizedService,
          message: sanitizedMessage
        });

        if (notificationSent && autoReplySent) {
        } else {
        }

        return notificationSent && autoReplySent;
      } catch (error) {
        throw new Error('Failed to send contact message');
      }
    },


    // Dashboard mutations

    updateAppointmentStatus: (_: any, { appointmentId, status }: { appointmentId: string; status: string }) => DashboardService.updateAppointmentStatus(appointmentId, status),

    updateOrderStatus: (_: any, { orderId, status }: { orderId: string; status: string }) => DashboardService.updateOrderStatus(orderId, status),

    resetChatbotModel: () => DashboardService.resetChatbotModel(),

    deleteConversation: (_: any, { conversationId }: { conversationId: string }) => DashboardService.deleteConversation(conversationId),

    addNoteToConversation: (_: any, { conversationId, note }: { conversationId: string; note: string }) => DashboardService.addNoteToConversation(conversationId, note),
    addChatMessage: (_: any, { conversationId, sender, text }: { conversationId: string; sender: string; text: string }) => DashboardService.saveChatMessage(conversationId, sender, text),
  },

};