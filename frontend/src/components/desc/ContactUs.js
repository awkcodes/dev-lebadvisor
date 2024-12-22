import React from 'react';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import './ContactUs.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';

const ContactUs = () => {
    const handleWhatsAppClick = () => {
        window.open('https://wa.me/96171941100', '_blank');
    };

    return (
        <div className="contact-container">
            <h1 className="contact-title">Contact Us</h1>
            <p className="contact-description">
                We would love to hear from you! You can reach us through the following methods:
            </p>

            <div className="contact-info">
                <div className="contact-method">
                    <PhoneIcon className="contact-method-icon" />
                    <h2 className="contact-method-title">Phone</h2>
                    <p className="contact-method-detail">+961 71 941 100</p>
                </div>

                <div className="contact-method">
                    <EmailIcon className="contact-method-icon" />
                    <h2 className="contact-method-title">Email</h2>
                    <p className="contact-method-detail"><a href="mailto:info@lebadvisor.com">info@lebadvisor.com</a></p>
                </div>
            </div>

            <div className="form-container">
                <iframe
                    className="contact-iframe"
                    title="Contact LebAdvisor"
                    onLoad={() => window.parent.scrollTo(0, 0)}
                    allowTransparency="true"
                    allow="geolocation; microphone; camera; fullscreen"
                    src="https://form.jotform.com/242277018965464"
                    frameBorder="0"
                    scrolling="yes"
                ></iframe>
            </div>

            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                margin: '20px 0',
                gap: '10px'
            }}>
                <p style={{ fontSize: '1.2rem', textAlign: 'center' }}>
                    3indak trip? Become a LebAdvisor and add your own trip
                </p>
                <FontAwesomeIcon 
                    icon={faWhatsapp} 
                    style={{
                        color: '#25D366',
                        fontSize: '2rem',
                        cursor: 'pointer'
                    }}
                    onClick={handleWhatsAppClick}
                />
            </div>
        </div>
    );
};

export default ContactUs;
