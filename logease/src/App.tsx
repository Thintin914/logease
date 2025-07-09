import { RouterProvider, createRoute, createRootRoute, createRouter } from '@tanstack/react-router'
import { StartPage } from './pages/StartPage';
import { CalculatorPage } from './pages/CalculatorPage';
import { ClientPage } from './pages/ClientPage';
import { MandayCalculatorPage } from './pages/MandayCalculatorPage';

// Define your root route
const rootRoute = createRootRoute();

// Define your routes
const startPageRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: StartPage,
})

const calculatorPageRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/calculator',
  component: CalculatorPage
})

const mandayCalculatorPageRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/manday-calculator',
  component: MandayCalculatorPage
})

const clientRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/client/$clientId',
  component: ClientPage
})

// Create router instance
const routeTree = rootRoute.addChildren([ startPageRoute, calculatorPageRoute, clientRoute, mandayCalculatorPageRoute ])
const router = createRouter({ routeTree })


// Register your router for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

export function App() {
  return <RouterProvider router={router} />;
}