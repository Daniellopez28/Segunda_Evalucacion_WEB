import { Container, Navbar, NavbarBrand } from 'reactstrap';

// Importar el componente de la carpeta components
import MenuCatalog from './complements/MenuCatalog.jsx';

export default function App() {
  return (
    <div className="bg-light min-vh-100 p-4">
      <Navbar className="shadow-sm rounded mb-4 px-4" style={{ backgroundColor: '#264d26' }}>
        <NavbarBrand className="fw-bold mb-0" style={{ color: '#F6E4C9', fontSize: '1.5rem' }}>
          Food DEI S.A. de R.L.
        </NavbarBrand>
      </Navbar>

      <Container fluid>
        <MenuCatalog />
      </Container>
    </div>
  );
}