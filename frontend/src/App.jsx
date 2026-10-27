import { Container, Navbar, NavbarBrand } from 'reactstrap';

// Importar el componente de la carpeta components
import MenuCatalog from '../components/MenuCatalog.jsx';

export default function App() {
  return (
    <div className="bg-light min-vh-100 p-4">
      <Navbar color="white" light className="shadow-sm rounded mb-4 px-4">
        <NavbarBrand  className="fw-bold text-success">
          Food DEI S.A. de R.L.
        </NavbarBrand>
      </Navbar>

      <Container fluid>
        <MenuCatalog />
      </Container>
    </div>
  );
}
