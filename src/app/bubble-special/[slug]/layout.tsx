import { Metadata } from "next";
import axios from "axios";

const SPECIAL_BUBBLE_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
const USER_ID = process.env.NEXT_PUBLIC_USER_ID;

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  try {
    // Fetch bubble data using the new API endpoint
    const response = await axios.post(
      `${SPECIAL_BUBBLE_BASE_URL}/api/artifacts/details`,
      { artifactId: params.slug, isDev: true },
      {
        headers: {
          "x-user-id": USER_ID,
          accept: "*/*",
          "Content-Type": "application/json",
        },
      }
    );

    const message = response.data.artifact;

    // Prepare metadata from the response
    const title = message.title || "Bubble Special";
    const description = message.description || "Explore this bubble.";
    const imageUrl =
      message.image ||
      "https://typo-user-images-dev.s3.us-east-1.amazonaws.com/metadata-images/a81add1a-b2d9-4ac8-9e08-9a7fd8ad3cfc/.png";

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        images: [{ url: imageUrl }],
        type: "website",
        url: `/bubble-special/${params.slug}`,
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
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
