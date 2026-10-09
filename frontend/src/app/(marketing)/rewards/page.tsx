import { permanentRedirect } from "next/navigation";

export default function LegacyRecognitionPage() {
  permanentRedirect("/recognitions");
}
