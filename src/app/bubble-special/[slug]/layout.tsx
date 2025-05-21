import { Metadata } from "next";
import axios from "axios";
import { useEffect } from "react";
import { MediaGatekeeper } from "@/utils";

const SPECIAL_BUBBLE_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
const USER_ID = process.env.NEXT_PUBLIC_USER_ID;

// Cleans attachment references from the message content by removing dollar signs that correspond to attachment indexes

function cleanAttachmentReferences(
  description: string,
  attachments: any[]
): string {
  if (!description) return "Explore this bubble.";

  // Create a Set of all attachment indexes for quick lookup
  const attachmentIndexes = new Set(attachments.map((a) => a.index));

  // Convert to character array to handle individual characters
  const chars = description.split("");

  // Find and remove $ characters at attachment positions
  for (let i = 0; i < chars.length; i++) {
    if (chars[i] === "$" && attachmentIndexes.has(i)) {
      chars[i] = " "; // Replace with a space instead of removing to maintain other indexes
    }
  }
  // Join back to string and clean up excess whitespace
  let cleanedText = chars
    .join("")
    .replace(/\s+/g, " ") // Replace multiple spaces with a single space
    .trim();

  // Check if we have any content left
  return cleanedText || "Explore this bubble.";
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  // Await the params before using them
  const { slug } = await params;
  try {
    // Fetch message data using the new API endpoint
    const response = await axios.post(
      `${SPECIAL_BUBBLE_BASE_URL}/api/webClient/message/${slug}`,
      {
        headers: {
          "x-user-id": USER_ID,
          accept: "*/*",
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
        url: `/bubble-special/${slug}`,
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
  return (
    <>
      <MediaGatekeeper />
      {children}
    </>
  );
}
