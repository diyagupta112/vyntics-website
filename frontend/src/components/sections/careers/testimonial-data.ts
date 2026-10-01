import type { StaticImageData } from "next/image";
import akashImage from "../../../../public/images/careers/team/akash-chaurasia.png";
import diyaImage from "../../../../public/images/careers/team/diya-gupta.png";
import vedImage from "../../../../public/images/careers/team/ved-sharma.png";
import vibhuImage from "../../../../public/images/careers/team/vibhu-pratap.png";
import vipulImage from "../../../../public/images/careers/team/vipul-sharma.png";

export type TeamTestimonial = {
  id: string;
  name: string;
  role: string;
  quote: string;
  imageUrl: StaticImageData;
  imageAlt: string;
  imagePosition: string;
  thumbnailPosition: string;
};

export const teamTestimonials: TeamTestimonial[] = [
  {
    id: "ved",
    name: "Ved",
    role: "AI Engineer",
    quote:
      "Vyntics gives you the space to take ownership and figure things out. You get to learn a lot by actually building.",
    imageUrl: vedImage,
    imageAlt: "Portrait of Ved",
    imagePosition: "center center",
    thumbnailPosition: "center 27%",
  },
  {
    id: "vibhu",
    name: "Vibhu",
    role: "AI Engineer",
    quote:
      "I really enjoy the way we approach problems together. There’s always room to share ideas, learn from each other, and find a better way forward.",
    imageUrl: vibhuImage,
    imageAlt: "Portrait of Vibhu",
    imagePosition: "center center",
    thumbnailPosition: "center 30%",
  },
  {
    id: "akash-chaurasia",
    name: "Akash Chaurasia",
    role: "Data Engineer",
    quote:
      "What I enjoy most about Vyntics is the freedom to explore ideas and actually turn them into something real.",
    imageUrl: akashImage,
    imageAlt: "Portrait of Akash Chaurasia",
    imagePosition: "center center",
    thumbnailPosition: "center 29%",
  },
  {
    id: "diya",
    name: "Diya",
    role: "Software Engineer",
    quote:
      "There’s always something new to learn here, and I really like how everyone is open to sharing ideas and helping each other.",
    imageUrl: diyaImage,
    imageAlt: "Portrait of Diya",
    imagePosition: "center center",
    thumbnailPosition: "center 28%",
  },
  {
    id: "vipul",
    name: "Vipul",
    role: "Software Engineer",
    quote:
      "The best part is getting to work on different kinds of problems while learning from the people around you.",
    imageUrl: vipulImage,
    imageAlt: "Portrait of Vipul",
    imagePosition: "center center",
    thumbnailPosition: "center 27%",
  },
];
