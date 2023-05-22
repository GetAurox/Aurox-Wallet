import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { Box } from "@mui/material";

import { useOnboardingData } from "ui/hooks";

import GetStartedSection from "./components/GetStartedSection";
import { Creation } from "./components/Creation";
import { PlayReel } from "./components/PlayReel";
import { TextSection } from "./components/TextSection";

import "./home.css";

export default function Home() {
  const navigate = useNavigate();
  const { data: onboardingData } = useOnboardingData();

  useEffect(() => {
    if (!onboardingData?.step || onboardingData.step === "main") {
      return;
    }

    if (onboardingData.step === "new") {
      navigate("/new-wallet");
    }

    if (onboardingData.step === "import") {
      navigate("/import-wallet");
    }

    if (onboardingData.step === "completed") {
      navigate("/congratulations");
    }
  }, [navigate, onboardingData?.step]);

  return (
    <>
      <GetStartedSection />
      <Box
        position="relative"
        sx={{
          background: "radial-gradient(50% 50.85% at 50% 63%, #111b35 0%, rgba(6, 11, 23, 0) 100%)",
          backgroundColor: "#060b17",
        }}
        zIndex={4}
      >
        <TextSection />
        <PlayReel />
      </Box>
      <Creation />
    </>
  );
}
