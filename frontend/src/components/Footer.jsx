import React from 'react';
import { Link } from 'react-router-dom';
import { footerQuickLinks, footerServices, socialLinks, textContent } from '../constants';

const Footer = () => {
  const { footer } = textContent;

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-2xl font-bold mb-4">{footer.companyName}</h3>
            <p className="text-gray-300 mb-4 max-w-md">
              {footer.description}
            </p>
            <p className="text-blue-400 font-semibold">{footer.tagline}</p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {footerQuickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-gray-300 hover:text-white transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Services</h4>
            <ul className="space-y-2">
              {footerServices.map((service) => (
                <li key={service} className="text-gray-300">
                  {service}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Social Links */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex space-x-6 mb-4 md:mb-0">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-white transition-colors duration-200"
                  aria-label={social.name}
                >
                  {social.icon === 'FaFacebookF' && <span>📘</span>}
                  {social.icon === 'FaWhatsapp' && <span>💬</span>}
                  {social.icon === 'FaInstagram' && <span>📷</span>}
                  {social.icon === 'FaTiktok' && <span>🎵</span>}
                </a>
              ))}
            </div>
            <div className="text-center md:text-right">
              <p className="text-gray-300 text-sm">
                {footer.copyright}
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;