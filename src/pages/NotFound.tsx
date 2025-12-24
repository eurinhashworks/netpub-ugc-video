import React from 'react';
import { useNavigate } from 'react-router-dom';
import './NotFound.css';

const NotFound: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="not-found-page">
            <div className="error-container">
                <div className="error-box">
                    <div className="error-header">
                        <div className="error-badge">404</div>
                    </div>

                    <h1 className="error-title">Page introuvable</h1>

                    <div className="error-code">
                        <span className="code-label">CODE:</span> page_not_found
                    </div>

                    <p className="error-description">
                        Nous n'avons pas trouvé la page que vous recherchez.
                        Elle a peut-être été déplacée ou supprimée.
                        Retournez à l'accueil ou contactez-nous si vous pensez qu'il s'agit d'une erreur.
                    </p>

                    <div className="error-actions">
                        <button
                            className="btn-primary"
                            onClick={() => navigate('/')}
                        >
                            Retour à l'accueil
                        </button>
                        <button
                            className="btn-secondary"
                            onClick={() => navigate('/contact')}
                        >
                            Nous contacter
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NotFound;
