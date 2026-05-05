import { PageContainer } from "@/components/layout/PageContainer";
import { TimerPage } from "@/components/timer/TimerPage";

export default function TimerRoute() {
  return (
    <PageContainer maxWidth="sm">
      <TimerPage />
    </PageContainer>
  );
}
