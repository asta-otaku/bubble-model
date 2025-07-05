import { Metadata } from "next";
import axios from "axios";
import { MediaGatekeeper } from "@/utils";

const SPECIAL_BUBBLE_BASE_URL = process.env.NEXT_PUBLIC_COLLECTION_URL;
const USER_ID = process.env.NEXT_PUBLIC_USER_ID;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  // Await the params before using them
  const { slug } = await params;
  try {
    // Fetch collection data using the API endpoint
    const response = await axios.get(
      `${SPECIAL_BUBBLE_BASE_URL}/api/webClient/collection/${slug}`,
      {
        headers: {
          "x-user-id": USER_ID,
          accept: "*/*",
        },
      }
    );

    const collectionData = response.data;

    const title =
      collectionData.title || collectionData.folderName || "Collection";
    const description =
      collectionData.description ||
      `Collection with ${collectionData.numberOfItems || 0} items`;
    const ownerName =
      `${collectionData.ownerProfile?.firstName || ""} ${
        collectionData.ownerProfile?.lastName || ""
      }`.trim() || "Unknown";

    const imageUrl =
      collectionData.imageUrl ||
      "https://typo-user-images-dev.s3.us-east-1.amazonaws.com/metadata-images/a81add1a-b2d9-4ac8-9e08-9a7fd8ad3cfc/.png";

    return {
      title,
      description: `${description} - Shared by ${ownerName}`,
      openGraph: {
        title,
        description: `${description} - Shared by ${ownerName}`,
        images: [{ url: imageUrl }],
        type: "website",
        url: `/collection/${slug}`,
      },
      twitter: {
        card: "summary_large_image",
        title,
        description: `${description} - Shared by ${ownerName}`,
        images: [imageUrl],
      },
    };
  } catch (error) {
    console.error("Error generating collection metadata", error);
    return {
      title: "Collection",
      description: "Explore this collection.",
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
