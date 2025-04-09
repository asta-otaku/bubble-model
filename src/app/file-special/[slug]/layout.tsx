import { Metadata } from "next";
import axios from "axios";
import { FileData } from "@/utils/BubbleSpecialInterfaces";

const SPECIAL_BUBBLE_BASE_URL = process.env.NEXT_PUBLIC_BASE_FILE_PREVIEW_URL;
const USER_ID = process.env.NEXT_PUBLIC_USER_ID;

/**
 * Cleans description text by removing attachment references
 */
function cleanDescription(description: string): string {
  if (!description) return "Explore this file.";

  // Remove any special characters or attachment references
  let cleanedText = description
    .replace(/\$\d+/g, "") // Remove attachment references like $0, $1
    .replace(/\s+/g, " ") // Normalize whitespace
    .trim();

  // If it's a file description, make it more readable
  if (cleanedText.startsWith("File:")) {
    cleanedText = `File preview: ${cleanedText.substring(5).trim()}`;
  }

  return cleanedText || "Explore this file.";
}

/**
 * Generates metadata for the file preview page
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  // Await the params before using them
  const { slug } = await params;

  if (!slug) {
    console.log("No slug parameter found");
    return {
      title: "File Preview",
      description: "Explore this file.",
    };
  }

  try {
    console.log(`Generating metadata for slug: ${slug}`);

    // Fetch file data from API
    const { data } = await axios.get(
      `${SPECIAL_BUBBLE_BASE_URL}/api/webClient/single-file/${slug}`,
      {
        headers: {
          "x-user-id": USER_ID,
          accept: "*/*",
          "Content-Type": "application/json",
        },
      }
    );

    console.log(
      "Received metadata response:",
      JSON.stringify(data).substring(0, 200) + "..."
    );

    // Extract necessary information for metadata
    const fileData: FileData = data;
    const textAttachment = fileData.textAttachment;
    const ownerProfile = fileData.ownerProfile;

    // Prepare title and description
    const title =
      fileData.title ||
      `${ownerProfile?.firstName || "Someone"} shared a file with you`;

    // Clean up description
    const description = cleanDescription(fileData.description);

    // Get image for preview
    const imageUrl =
      fileData.image ||
      (textAttachment?.cloudFrontDownloadLink &&
      /\.(jpg|jpeg|png|gif|webp)$/i.test(textAttachment.cloudFrontDownloadLink)
        ? textAttachment.cloudFrontDownloadLink
        : textAttachment?.attachedContent?.thumbnailImage
        ? `https://d1dt25l2ehqbsl.cloudfront.net/file/thumbnails/${textAttachment.attachedContent.thumbnailImage}.png`
        : "https://typo-user-images-dev.s3.us-east-1.amazonaws.com/metadata-images/default-image.png");

    console.log(
      `Generated metadata - Title: "${title}", Description: "${description}"`
    );

    // Return complete metadata
    return {
      metadataBase: new URL(
        process.env.NEXT_PUBLIC_BASE_URL || "https://app.usetypo.com"
      ),
      title,
      description,
      openGraph: {
        title,
        description,
        images: [{ url: imageUrl }],
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [imageUrl],
      },
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
      title: "File Preview",
      description: "Explore this file.",
      openGraph: {
        title: "File Preview",
        description: "Explore this file.",
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title: "File Preview",
        description: "Explore this file.",
      },
    };
  }
}

export default function Layout({ children }: { children: React.ReactNode }) {
  // This layout doesn't override any HTML structure, it just adds metadata
  return <>{children}</>;
}
