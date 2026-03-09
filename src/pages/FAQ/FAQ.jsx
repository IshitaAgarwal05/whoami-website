import './FAQ.css';

const FAQ = () => {
    const faqs = [
        {
            question: "What products do you offer?",
            answer: "We create handcrafted desk accessories, collectibles, and identity pieces inspired by wizarding worlds, superhero universes, galactic sagas, and more. All products are 3D-printed or laser-cut in India with premium materials."
        },
        {
            question: "Where are your products made?",
            answer: "All our products are designed, crafted, and shipped from Jaipur, India. We use 3D printing and laser cutting technology combined with Indian precision engineering."
        },
        {
            question: "Do you ship across India?",
            answer: "Yes! We ship across India with care. Shipping times and charges may vary based on your location."
        },
        {
            question: "Can I request custom designs?",
            answer: "Absolutely! We love creating custom identity artifacts. Reach out to us via email at studios.whoami@gmail.com, or DM us on Instagram @whoami.studios with your ideas."
        },
        {
            question: "What materials do you use?",
            answer: "We use premium PLA plastic for 3D printing and high-quality acrylic / MDF wood for laser cutting. All materials are durable and designed to last."
        },
        {
            question: "Are these officially licensed products?",
            answer: "Our products are fan-made identity artifacts inspired by popular universes. We use abstracted symbols and designs to celebrate fandom culture while respecting intellectual property."
        },
        {
            question: "How long does delivery take?",
            answer: "Delivery typically takes 5-7 business days within India, depending on your location. Each product is crafted to order."
        },
        {
            question: "What if I'm not satisfied with my order?",
            answer: "Customer satisfaction is important to us. If there's any issue with your order, please contact us at studios.whoami@gmail.com, or DM us on Instagram @whoami.studios within 3 days of delivery."
        },
        {
            question: "Do you offer gift wrapping?",
            answer: "While we don't currently offer gift wrapping, all products are packaged with care. If you're buying a gift, let us know in your order notes and we can add a personal touch!"
        },
        {
            question: "How do I care for my product?",
            answer: "Keep your artifacts away from direct sunlight and extreme temperatures. Dust gently with a soft cloth. 3D-printed items are durable but should be handled with care."
        }
    ];

    return (
        <div className="faq-page">
            <div className="container">
                {/* Header */}
                <div className="faq-header">
                    <h1>Frequently Asked Questions</h1>
                    <p className="faq-subtitle">
                        Everything you need to know about WhoAmI and our identity artifacts.
                    </p>
                </div>

                {/* FAQ List */}
                <div className="faq-list">
                    {faqs.map((faq, index) => (
                        <div key={index} className="faq-item">
                            <h3 className="faq-question">
                                <span className="faq-number">Q{index + 1}.</span> {faq.question}
                            </h3>
                            <p className="faq-answer">{faq.answer}</p>
                        </div>
                    ))}
                </div>

                {/* Contact CTA */}
                <div className="faq-cta">
                    <h2>Still have questions?</h2>
                    <p>
                        We're here to help! Reach out to us at{' '}
                        <a href="mailto:studios.whoami@gmail.com">studios.whoami@gmail.com</a>
                        {' '}or follow us on{' '}
                        <a href="https://www.instagram.com/whoami.studios" target="_blank" rel="noopener noreferrer">
                            Instagram @whoami.studios
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default FAQ;
