import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, CardBody, Button, Badge, Alert, Navbar, NavbarBrand } from 'reactstrap';

// Importar el componente de la carpeta components
import MenuCatalog from '../components/MenuCatalog.jsx';

export default function App() {
  return (
    <div className="bg-light min-vh-100 p-4">
      {/* Barra superior de prueba */}
      <Navbar color="white" light expand="md" className="shadow-sm rounded mb-4 px-4">
        <NavbarBrand href="/" className="fw-bold text-success">
          Food DEI S.A. de R.L.
        </NavbarBrand>
      </Navbar>

      {/* Contenedor principal donde se muestra tu MenuCatalog */}
      <Container fluid>
        <Row>
          <Col md={12}>
            <MenuCatalog />
          </Col>
        </Row>
      </Container>
    </div>
  );
}