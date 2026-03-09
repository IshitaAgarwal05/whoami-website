import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './FaqFolders.css';

const faqData = [
    {
        question: "What products?",
        answer: "We create handcrafted desk accessories, collectibles, and identity pieces inspired by wizarding worlds, superhero universes, galactic sagas, and more. All products are 3D-printed or laser-cut in India with premium materials."
    },
    {
        question: "Where are they made?",
        answer: "All our products are designed, crafted, and shipped from Jaipur, India. We use 3D printing and laser cutting technology combined with Indian precision engineering."
    },
    {
        question: "Shipping across India?",
        answer: "Yes! We ship across India with care. Delivery typically takes 5–7 business days depending on your location. Each product is crafted to order."
    },
    {
        question: "Custom designs?",
        answer: "Absolutely! We love creating custom identity artifacts. Reach out to us via email at studios.whoami@gmail.com, or DM us on Instagram @whoami.studios with your ideas."
    },
    {
        question: "Materials used?",
        answer: "We use premium PLA plastic for 3D printing and high-quality acrylic / MDF wood for laser cutting. All materials are durable and designed to last."
    },
    {
        question: "Officially licensed?",
        answer: "Our products are fan-made identity artifacts inspired by popular universes. We use abstracted symbols and designs to celebrate fandom culture while respecting intellectual property."
    },
    {
        question: "Return policy?",
        answer: "Customer satisfaction is important to us. If there's any issue with your order, please contact us at studios.whoami@gmail.com, or DM us on Instagram @whoami.studios within 3 days of delivery."
    },
    {
        question: "Gift wrapping?",
        answer: "While we don't currently offer gift wrapping, all products are packaged with care. If you're buying a gift, let us know in your order notes and we'll add a personal touch!"
    },
    {
        question: "Product care?",
        answer: "Keep your artifacts away from direct sunlight and extreme temperatures. Dust gently with a soft cloth. 3D-printed items are durable but should be handled with care."
    }
];

/* Classic yellow Windows folder icon as SVG */
const FolderIcon = ({ isOpen }) => (
    <svg width="40" height="36" viewBox="0 0 40 36" fill="none" xmlns="http://www.w3.org/2000/svg">
        {isOpen ? (
            /* Open folder */
            <>
                <path d="M2 6C2 4.89543 2.89543 4 4 4H14L18 8H34C35.1046 8 36 8.89543 36 10V12H8L2 30V6Z" fill="#E8B230" />
                <path d="M4 12H36L38 30C38.1 31.1 37.2 32 36.1 32H5.9C4.8 32 3.9 31.1 4 30L4 12Z" fill="#FDD835" />
                <path d="M4 12H36L38 30C38.1 31.1 37.2 32 36.1 32H5.9C4.8 32 3.9 31.1 4 30L4 12Z" fill="url(#folderGradOpen)" />
                <defs>
                    <linearGradient id="folderGradOpen" x1="21" y1="12" x2="21" y2="32" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#FDD835" />
                        <stop offset="1" stopColor="#E8B230" />
                    </linearGradient>
                </defs>
            </>
        ) : (
            /* Closed folder */
            <>
                <path d="M2 6C2 4.89543 2.89543 4 4 4H14L18 8H36C37.1046 8 38 8.89543 38 10V30C38 31.1046 37.1046 32 36 32H4C2.89543 32 2 31.1046 2 30V6Z" fill="#FDD835" />
                <path d="M2 6C2 4.89543 2.89543 4 4 4H14L18 8H36C37.1046 8 38 8.89543 38 10V30C38 31.1046 37.1046 32 36 32H4C2.89543 32 2 31.1046 2 30V6Z" fill="url(#folderGrad)" />
                <path d="M2 10H38V12H2V10Z" fill="#E8B230" opacity="0.5" />
                <defs>
                    <linearGradient id="folderGrad" x1="20" y1="4" x2="20" y2="32" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#FFE082" />
                        <stop offset="0.5" stopColor="#FDD835" />
                        <stop offset="1" stopColor="#E8B230" />
                    </linearGradient>
                </defs>
            </>
        )}
    </svg>
);

/* New folder (+ icon) */
const NewFolderIcon = () => (
    <svg width="40" height="36" viewBox="0 0 40 36" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M2 6C2 4.89543 2.89543 4 4 4H14L18 8H36C37.1046 8 38 8.89543 38 10V30C38 31.1046 37.1046 32 36 32H4C2.89543 32 2 31.1046 2 30V6Z" fill="#FDD835" opacity="0.4" />
        <path d="M2 10H38V12H2V10Z" fill="#E8B230" opacity="0.3" />
        <line x1="20" y1="16" x2="20" y2="28" stroke="#FDD835" strokeWidth="2" strokeLinecap="round" />
        <line x1="14" y1="22" x2="26" y2="22" stroke="#FDD835" strokeWidth="2" strokeLinecap="round" />
    </svg>
);

const FaqFolders = () => {
    const [activeIndex, setActiveIndex] = useState(null);
    const navigate = useNavigate();

    const handleToggle = (index) => {
        setActiveIndex(activeIndex === index ? null : index);
    };

    const handleNewQuery = () => {
        navigate('/contact');
    };

    return (
        <section className="faq-folders-section">
            <div className="container">
                <div className="faq-folders-header">
                    <h2>Quick Answers</h2>
                    <p className="faq-folders-subtitle">
                        Browse common questions — double-click a folder to peek inside.
                    </p>
                </div>

                {/* Windows Explorer Window */}
                <div className="win-explorer">
                    {/* Title Bar */}
                    <div className="win-titlebar">
                        <div className="win-titlebar-left">
                            <svg width="16" height="14" viewBox="0 0 16 14" fill="none" className="win-titlebar-icon">
                                <path d="M1 2C1 1.44772 1.44772 1 2 1H6L7.5 3H14C14.5523 3 15 3.44772 15 4V12C15 12.5523 14.5523 13 14 13H2C1.44772 13 1 12.5523 1 12V2Z" fill="#FDD835" />
                            </svg>
                            <span>WhoAmI FAQ</span>
                        </div>
                        <div className="win-titlebar-buttons">
                            <div className="win-btn win-btn-minimize">
                                <svg width="10" height="1" viewBox="0 0 10 1"><rect width="10" height="1" fill="currentColor" /></svg>
                            </div>
                            <div className="win-btn win-btn-maximize">
                                <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><rect x="0.5" y="0.5" width="9" height="9" stroke="currentColor" strokeWidth="1" /></svg>
                            </div>
                            <div className="win-btn win-btn-close">
                                <svg width="10" height="10" viewBox="0 0 10 10"><line x1="1" y1="1" x2="9" y2="9" stroke="currentColor" strokeWidth="1.2" /><line x1="9" y1="1" x2="1" y2="9" stroke="currentColor" strokeWidth="1.2" /></svg>
                            </div>
                        </div>
                    </div>

                    {/* Address / Navigation Bar */}
                    <div className="win-navbar">
                        <div className="win-nav-arrows">
                            <span className="win-nav-btn">←</span>
                            <span className="win-nav-btn">→</span>
                            <span className="win-nav-btn">↑</span>
                        </div>
                        <div className="win-addressbar">
                            <span className="win-address-icon">📁</span>
                            <span>This PC › Desktop › WhoAmI › FAQ</span>
                        </div>
                        <div className="win-search">
                            <span>🔍 Search FAQ</span>
                        </div>
                    </div>

                    {/* Toolbar */}
                    <div className="win-toolbar">
                        <span className="win-toolbar-item">Name</span>
                        <span className="win-toolbar-item win-toolbar-status">{faqData.length} items</span>
                    </div>

                    {/* Folder Grid */}
                    <div className="win-folder-area">
                        <div className="win-folder-grid">
                            {faqData.map((item, index) => (
                                <div
                                    key={index}
                                    className={`win-folder ${activeIndex === index ? 'win-folder-selected' : ''}`}
                                    onClick={() => handleToggle(index)}
                                >
                                    <FolderIcon isOpen={activeIndex === index} />
                                    <span className="win-folder-label">{item.question}</span>
                                </div>
                            ))}

                            {/* + Create New Query folder */}
                            <div className="win-folder win-folder-new" onClick={handleNewQuery}>
                                <NewFolderIcon />
                                <span className="win-folder-label win-folder-label-new">+ New Query</span>
                            </div>
                        </div>

                        {/* Preview Panel (shows when a folder is selected) */}
                        {activeIndex !== null && (
                            <div className="win-preview-panel">
                                <div className="win-preview-header">
                                    <FolderIcon isOpen={true} />
                                    <h4>{faqData[activeIndex].question}</h4>
                                </div>
                                <div className="win-preview-divider" />
                                <p className="win-preview-answer">{faqData[activeIndex].answer}</p>
                                <div className="win-preview-meta">
                                    <span>Type: FAQ Folder</span>
                                    <span>Size: 1 answer</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Status Bar */}
                    <div className="win-statusbar">
                        <span>{faqData.length} items</span>
                        <span>{activeIndex !== null ? `Selected: "${faqData[activeIndex].question}"` : 'Ready'}</span>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default FaqFolders;
