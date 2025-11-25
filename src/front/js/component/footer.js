import React, { Component } from "react";
import "../../styles/footer.css";

export const Footer = () => (
	<footer className="footer">
  <div className="footer-container">
    <div className="footer-section">
      <h3>ProTech</h3>
      <p>Tu tienda de tecnología confiable. Encuentra los mejores productos al mejor precio.</p>
    </div>
    <div className="footer-section">
      <h4>Enlaces rápidos</h4>
      <ul>
        <li><a href="/about">Sobre nosotros</a></li>
        <li><a href="/contact">Contáctanos</a></li>
        <li><a href="/faq">Preguntas frecuentes</a></li>
        <li><a href="/policy">Políticas</a></li>
      </ul>
    </div>
    <div className="footer-section">
      <h4>Síguenos</h4>
      <div className="social-icons">
        <a href="#"><i className="fab fa-facebook"></i></a>
        <a href="#"><i className="fab fa-twitter"></i></a>
        <a href="#"><i className="fab fa-instagram"></i></a>
        <a href="#"><i className="fab fa-linkedin"></i></a>
      </div>
    </div>
  </div>
  <div className="footer-bottom">
    <p>&copy; 2024 ProTech. Todos los derechos reservados.</p>
  </div>
</footer>
);
