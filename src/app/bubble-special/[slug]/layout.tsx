import { Metadata } from "next";
import axios from "axios";

const SPECIAL_BUBBLE_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
const USER_ID = process.env.NEXT_PUBLIC_USER_ID;

function cleanAttachmentReferences(
  description: string,
  attachments: any[]
): string {
  if (!description) return "Explore this bubble.";

  const attachmentIndexes = new Set(attachments.map((a) => a.index));
  const chars = description.split("");

  for (let i = 0; i < chars.length; i++) {
    if (chars[i] === "$" && attachmentIndexes.has(i)) {
      chars[i] = " ";
    }
  }
  let cleanedText = chars.join("").replace(/\s+/g, " ").trim();

  return cleanedText || "Explore this bubble.";
}
export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  try {
    const response = await axios.post(
      `${SPECIAL_BUBBLE_BASE_URL}/api/webClient/details-with-image`,
      { messageId: params.slug, isDev: true },
      {
        headers: {
          "x-user-id": USER_ID,
          accept: "/",
          "Content-Type": "application/json",
        },
      }
    );

    const message = response.data.message;
    const attachments = message.attachments || [];

    const title = message.title || "Bubble Special";
    const rawDescription = message.description || "Explore this bubble.";
    const cleanedDescription = cleanAttachmentReferences(
      rawDescription,
      attachments
    );

    const imageUrl =
      message.image ||
      "https://typo-user-images-dev.s3.us-east-1.amazonaws.com/metadata-images/a81add1a-b2d9-4ac8-9e08-9a7fd8ad3cfc/.png";

    return {
      title,
      description: cleanedDescription,
      openGraph: {
        title,
        description: cleanedDescription,
        images: [{ url: imageUrl }],
        type: "website",
        url: `/bubble-special/${params.slug}`,
      },
      twitter: {
        card: "summary_large_image",
        title,
        description: cleanedDescription,
        images: [imageUrl],
      },
    };
  } catch (error) {
    console.error("Error generating metadata", error);
    return {
      title: "Bubble Special",
      description: "Explore this bubble.",
    };
  }
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
