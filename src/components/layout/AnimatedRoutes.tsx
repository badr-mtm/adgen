import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { PageTransitionWrapper } from "./PageTransitionWrapper";
import Dashboard from "@/pages/Dashboard";
import Create from "@/pages/Create";
import Campaigns from "@/pages/Campaigns";
import CampaignDetails from "@/pages/CampaignDetails";
import CampaignSchedules from "@/pages/CampaignSchedules";
import Assets from "@/pages/Assets";
import Reports from "@/pages/Reports";
import Integrations from "@/pages/Integrations";
import Billing from "@/pages/Billing";
import AISuggestions from "@/pages/AISuggestions";
import Settings from "@/pages/Settings";
import Editor from "@/pages/Editor";
import VideoEditor from "@/pages/VideoEditor";
import Auth from "@/pages/Auth";
import BrandSetup from "@/pages/BrandSetup";
import Storyboard from "@/pages/Storyboard";
import ScriptSelection from "@/pages/ScriptSelection";
import Strategy from "@/pages/Strategy";
import NotFound from "@/pages/NotFound";

export function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route
          path="/dashboard"
          element={
            <PageTransitionWrapper>
              <Dashboard />
            </PageTransitionWrapper>
          }
        />
        <Route
          path="/create"
          element={
            <PageTransitionWrapper>
              <Create />
            </PageTransitionWrapper>
          }
        />
        <Route
          path="/campaigns"
          element={
            <PageTransitionWrapper>
              <Campaigns />
            </PageTransitionWrapper>
          }
        />
        <Route path="/ad-operations" element={<Navigate to="/campaigns" replace />} />
        <Route
          path="/campaign/:id"
          element={
            <PageTransitionWrapper>
              <CampaignDetails />
            </PageTransitionWrapper>
          }
        />
        <Route
          path="/campaign-schedules"
          element={
            <PageTransitionWrapper>
              <CampaignSchedules />
            </PageTransitionWrapper>
          }
        />
        <Route
          path="/assets"
          element={
            <PageTransitionWrapper>
              <Assets />
            </PageTransitionWrapper>
          }
        />
        <Route
          path="/reports"
          element={
            <PageTransitionWrapper>
              <Reports />
            </PageTransitionWrapper>
          }
        />
        <Route
          path="/integrations"
          element={
            <PageTransitionWrapper>
              <Integrations />
            </PageTransitionWrapper>
          }
        />
        <Route
          path="/billing"
          element={
            <PageTransitionWrapper>
              <Billing />
            </PageTransitionWrapper>
          }
        />
        <Route
          path="/ai-suggestions"
          element={
            <PageTransitionWrapper>
              <AISuggestions />
            </PageTransitionWrapper>
          }
        />
        <Route
          path="/settings"
          element={
            <PageTransitionWrapper>
              <Settings />
            </PageTransitionWrapper>
          }
        />
        <Route
          path="/editor"
          element={
            <PageTransitionWrapper>
              <Editor />
            </PageTransitionWrapper>
          }
        />
        <Route
          path="/editor/:campaignId"
          element={
            <PageTransitionWrapper>
              <Editor />
            </PageTransitionWrapper>
          }
        />
        <Route
          path="/video-editor/:id"
          element={
            <PageTransitionWrapper>
              <VideoEditor />
            </PageTransitionWrapper>
          }
        />
        <Route
          path="/strategy/:id"
          element={
            <PageTransitionWrapper>
              <Strategy />
            </PageTransitionWrapper>
          }
        />
        <Route
          path="/storyboard/:id"
          element={
            <PageTransitionWrapper>
              <Storyboard />
            </PageTransitionWrapper>
          }
        />
        <Route
          path="/script-selection"
          element={
            <PageTransitionWrapper>
              <ScriptSelection />
            </PageTransitionWrapper>
          }
        />
        <Route
          path="/auth"
          element={
            <PageTransitionWrapper>
              <Auth />
            </PageTransitionWrapper>
          }
        />
        <Route
          path="/brand-setup"
          element={
            <PageTransitionWrapper>
              <BrandSetup />
            </PageTransitionWrapper>
          }
        />
        <Route
          path="*"
          element={
            <PageTransitionWrapper>
              <NotFound />
            </PageTransitionWrapper>
          }
        />
      </Routes>
    </AnimatePresence>
  );
}
