import { useState, type FormEvent } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Mail,
  MessageCircle,
  Package,
  ShieldCheck,
  Clock,
} from "lucide-react";
import { Link } from "react-router-dom";
import "./Contact.css";
import React from "react";

const faqs = [
  {
    question: "How can I track my order?",
    answer:
      "Sign in to your Shopora account and visit the Orders section to view your order information.",
  },
  {
    question: "How can I find products?",
    answer: "Browse the Shop page to search products, explore categories and apply price filters.",
  },
  {
    question: "How do I manage my account?",
    answer: "Visit your profile page to review and manage your account information.",
  },
  {
    question: "Can I modify my cart?",
    answer: "Yes. You can add, remove or update items in your cart before checkout.",
  },
];

function Contact() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    topic: "General enquiry",
    message: "",
  });

  const [submitted, setSubmitted] = useState(false);

  const updateField = (field: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
  };

  return (
    <main className="contact-page">
      {/* HERO */}

      <section className="contact-hero">
        <div>
          <span className="about-eyebrow">WE'RE ALWAYS HAPPY TO HELP</span>

          <h1>
            Let's make things
            <br />
            <span>happen.</span>
          </h1>

          <p>Questions, feedback or need a hand with your shopping? We'd love to hear from you.</p>
        </div>

        <div className="contact-hero-decoration">
          <MessageCircle size={120} strokeWidth={0.7} />
          <span>LET'S TALK</span>
        </div>
      </section>

      {/* CONTACT CONTENT */}

      <section className="contact-main">
        <div className="contact-info">
          <span className="about-eyebrow">GET IN TOUCH</span>

          <h2>
            How can we
            <br />
            help you?
          </h2>

          <p className="contact-info-description">
            Whatever you need, we're here to help make your Shopora experience better.
          </p>

          <div className="contact-info-list">
            <div className="contact-info-item">
              <div className="contact-info-icon">
                <MessageCircle />
              </div>
              <div>
                <h3>General Enquiries</h3>
                <p>Questions about shopping with Shopora.</p>
              </div>
            </div>

            <div className="contact-info-item">
              <div className="contact-info-icon">
                <Package />
              </div>
              <div>
                <h3>Orders & Shopping</h3>
                <p>Find information about your purchases.</p>
                <Link to="/orders">
                  View Orders <ArrowUpRight size={14} />
                </Link>
              </div>
            </div>

            <div className="contact-info-item">
              <div className="contact-info-icon">
                <ShieldCheck />
              </div>
              <div>
                <h3>Account Assistance</h3>
                <p>Need help with your Shopora account?</p>
                <Link to="/profile">
                  My Account <ArrowUpRight size={14} />
                </Link>
              </div>
            </div>
          </div>

          <div className="contact-note">
            <Clock size={20} />
            <div>
              <h4>We're listening.</h4>
              <p>Send us your query through the form and we'll be ready to help.</p>
            </div>
          </div>
        </div>

        {/* FORM */}

        <div className="contact-form-wrapper">
          {submitted ? (
            <div className="contact-success">
              <div className="contact-success-icon">
                <Mail size={35} />
              </div>
              <h2>Thank you!</h2>
              <p>
                Your form passed validation. Message delivery will be available once the support API
                is connected.
              </p>

              <button
                className="contact-submit-btn"
                onClick={() => {
                  setSubmitted(false);
                  setForm({
                    name: "",
                    email: "",
                    topic: "General enquiry",
                    message: "",
                  });
                }}
              >
                Send another message <ArrowRight size={17} />
              </button>
            </div>
          ) : (
            <>
              <span className="about-eyebrow">DROP US A MESSAGE</span>
              <h2>We'd love to hear from you.</h2>
              <p className="contact-form-intro">
                Fill in the details below. We'll take it from here.
              </p>

              <form onSubmit={handleSubmit}>
                <div className="contact-field-row">
                  <div className="contact-field">
                    <label htmlFor="contact-name">Your name *</label>
                    <input
                      id="contact-name"
                      type="text"
                      placeholder="Enter your name"
                      value={form.name}
                      onChange={(e) => updateField("name", e.target.value)}
                      required
                    />
                  </div>

                  <div className="contact-field">
                    <label htmlFor="contact-email">Email address *</label>
                    <input
                      id="contact-email"
                      type="email"
                      placeholder="you@example.com"
                      value={form.email}
                      onChange={(e) => updateField("email", e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="contact-field">
                  <label htmlFor="contact-topic">What can we help with?</label>
                  <select
                    id="contact-topic"
                    value={form.topic}
                    onChange={(e) => updateField("topic", e.target.value)}
                  >
                    <option>General enquiry</option>
                    <option>Product enquiry</option>
                    <option>Order assistance</option>
                    <option>Returns and refunds</option>
                    <option>Account support</option>
                    <option>Other</option>
                  </select>
                </div>

                <div className="contact-field">
                  <label htmlFor="contact-message">Your message *</label>
                  <textarea
                    id="contact-message"
                    placeholder="Tell us how we can help..."
                    rows={6}
                    maxLength={1000}
                    value={form.message}
                    onChange={(e) => updateField("message", e.target.value)}
                    required
                  />
                  <span className="contact-character-count">{form.message.length}/1000</span>
                </div>
                <button type="submit" className="contact-submit-btn">
                  Send Message <ArrowRight size={18} />
                </button>
                <p className="contact-form-disclaimer">
                  Your information is used only for handling this enquiry. Connect the form to a
                  secure backend before collecting real customer messages.
                </p>
              </form>
            </>
          )}
        </div>
      </section>

      {/* FAQ */}

      <section className="contact-faq">
        <div className="contact-faq-heading">
          <span className="about-eyebrow">NEED A QUICK ANSWER?</span>
          <h2>
            Frequently asked questions<span>.</span>
          </h2>
          <p>Some helpful answers to get you started.</p>
        </div>

        <div className="contact-faq-list">
          {faqs.map((faq, index) => (
            <details key={faq.question} className="contact-faq-item">
              <summary>
                <span className="contact-faq-number">0{index + 1}</span>
                {faq.question}
                <span className="contact-faq-plus">+</span>
              </summary>

              <p>{faq.answer}</p>
            </details>
          ))}
        </div>
      </section>
    </main>
  );
}

export default React.memo(Contact);
