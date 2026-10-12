import { RecognitionsHeroShell } from "@/components/sections/recognitions/recognitions-hero";
import { RecognitionFeedSkeleton } from "@/components/sections/recognitions/recognition-skeleton";

export default function RecognitionsLoading() {
  return <RecognitionsHeroShell loading><RecognitionFeedSkeleton /></RecognitionsHeroShell>;
}
