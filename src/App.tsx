import { AppHeader } from "./components/AppHeader";
import { MainWorkspace } from "./components/MainWorkspace";
import { RestBonusModal } from "./components/RestBonusModal";
import { ClockOutCelebrationModal } from "./components/ClockOutCelebrationModal";
import { useAppController } from "./hooks/useAppController";

export default function App() {
  const controller = useAppController();

  return (
    <div className="animal-cursor h-screen max-h-screen w-screen overflow-hidden bg-[#f8f8f0] bg-leaf-pattern relative antialiased flex flex-col justify-between">
      <AppHeader
        headerRef={controller.appHeaderRef}
        lang={controller.lang}
        setLang={controller.setLang}
        showLanguagePicker={controller.showLanguagePicker}
        setShowLanguagePicker={controller.setShowLanguagePicker}
        t={controller.t}
      />

      <MainWorkspace
        activeUnit={controller.activeUnit}
        endTime={controller.endTime}
        helperSubtext={controller.helperSubtext}
        isCustomRhythm={controller.isCustomRhythm}
        isMobile={controller.isMobile}
        loadPreset={controller.loadPreset}
        miles={controller.miles}
        mobileContentEdgeGap={controller.mobileContentEdgeGap}
        mobileDockOverlap={controller.mobileDockOverlap}
        mobileDockRef={controller.mobileDockRef}
        mobileLayoutRootRef={controller.mobileLayoutRootRef}
        mobileTab={controller.mobileTab}
        isClockOutMusicPaused={controller.isClockOutMusicPaused}
        presets={controller.presets}
        restDuration={controller.restDuration}
        restInterval={controller.restInterval}
        restReminderActive={controller.restReminderActive}
        scaleFactor={controller.scaleFactor}
        setActiveUnit={controller.setActiveUnit}
        setEndTime={controller.setEndTime}
        setIsCustomRhythm={controller.setIsCustomRhythm}
        setMobileTab={controller.setMobileTab}
        setRestDuration={controller.setRestDuration}
        setRestInterval={controller.setRestInterval}
        setRestReminderActive={controller.handleSetRestReminderActive}
        setStartTime={controller.setStartTime}
        startTime={controller.startTime}
        t={controller.t}
        timerCalc={controller.timerCalc}
        formatNextBreakTimer={controller.formatNextBreakTimer}
        onSimulateRest={controller.handleSimulateRest}
        onSubmitClockOut={controller.handleSubmitClockOut}
        onToggleClockOutPlayback={controller.handleToggleClockOutMusicPreference}
      />

      <RestBonusModal
        isResting={controller.isResting}
        onClose={controller.handleSkipRest}
        restTimeLeft={controller.restTimeLeft}
        currentQuote={controller.currentQuote}
        onSkipRest={controller.handleSkipRest}
        onFinishRest={controller.handleFinishRest}
        t={controller.t}
        lang={controller.lang}
      />

      <ClockOutCelebrationModal
        visible={controller.showClockOutModal}
        onClose={controller.handleCloseClockOut}
        isMusicPaused={controller.isClockOutMusicPaused}
        onTogglePlayback={controller.handleToggleClockOutPlayback}
        isMobile={controller.isMobile}
        t={controller.t}
      />

      <footer
        className="fixed bottom-0 left-0 right-0 h-[45px] bg-repeat-x bg-bottom pointer-events-none z-[5] shrink-0"
        style={{
          backgroundImage: "url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22140%22 height=%2260%22 viewBox=%220 0 140 60%22%3E%3Cpath d=%22M10,60 C15,40 25,25 35,25 C45,25 55,40 60,60 M55,60 C60,45 68,32 78,32 C88,32 96,45 101,60 M95,60 C100,50 106,42 114,42 C122,42 128,50 133,60%22 fill=%22%238ac68a%22 opacity=%220.45%22/%3E%3Cpath d=%22M0,60 C5,45 15,30 25,30 C35,30 45,45 50,60 M45,60 C50,48 57,38 67,38 C77,38 84,48 89,60 M85,60 C90,52 96,45 104,45 C112,45 118,52 123,60%22 fill=%22%236fba2c%22 opacity=%220.7%22/%3E%3C/svg%3E')",
          backgroundSize: "70px 22px",
        }}
      />
    </div>
  );
}
