import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import NotFound from '@/pages/not-found';
import { Route, Switch, Router as WouterRouter } from 'wouter';
import { AuthProvider } from '@/lib/auth';
import { ProtectedRoute } from '@/components/protected-route';

import Login from '@/pages/login';
import Dashboard from '@/pages/dashboard';
import Candidates from '@/pages/candidates';
import NewCandidate from '@/pages/candidates/new';
import CandidateDetail from '@/pages/candidates/id';
import Jobs from '@/pages/jobs';
import NewJob from '@/pages/jobs/new';
import JobDetail from '@/pages/jobs/id';
import Match from '@/pages/match';

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <ProtectedRoute path="/" component={Dashboard} />
      <ProtectedRoute path="/candidates" component={Candidates} />
      <ProtectedRoute path="/candidates/new" component={NewCandidate} />
      <ProtectedRoute path="/candidates/:id" component={CandidateDetail} />
      <ProtectedRoute path="/jobs" component={Jobs} />
      <ProtectedRoute path="/jobs/new" component={NewJob} />
      <ProtectedRoute path="/jobs/:id" component={JobDetail} />
      <ProtectedRoute path="/match" component={Match} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
