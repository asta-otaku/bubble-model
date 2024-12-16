import fallback from "../assets/fallbackLinkImage.svg";

function RenderLinkPreview({
  getDisplayUrl,
  token,
  setFaviconError,
  faviconError,
  openImageModal,
}: {
  getDisplayUrl: (url: string) => { hostname: string; origin: string };
  token: any;
  setFaviconError: any;
  faviconError: any;
  openImageModal: any;
}) {
  const { hostname } = getDisplayUrl(token.content?.url || "");

  return (
    <div className="flex max-w-xs w-full p-3 flex-col gap-3 rounded-[14px] bg-white border border-solid border-[#1919191a]">
      <div className="flex justify-between items-center self-stretch gap-3">
        <div className="flex justify-between items-center self-stretch gap-3 flex-nowrap">
          <div className="w-6 h-6 rounded border border-solid border-[#1919191a] flex items-center justify-center">
            <img
              src={
                faviconError ? fallback : token.metaData?.faviconUrl ?? fallback
              }
              width={24}
              height={24}
              alt="Site favicon"
              className="w-full h-full object-contain"
              onError={() => setFaviconError(true)}
            />
          </div>
          <div className="inline-block items-center gap-1.5 text-xs font-medium text-primary whitespace-nowrap max-w-[137px] truncate overflow-hidden">
            {hostname}
          </div>
        </div>
        <a
          href={token.content?.url}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-transparent border border-solid border-[#1919191A] text-xs text-[#191919] px-2 py-1 rounded-full"
        >
          {hostname.includes("twitter.com") ? "Visit Tweet" : "Visit Link"}
        </a>
      </div>
      <h2 className="text-[#7e7e7e] text-sm line-clamp-1">
        {token.metaData?.title}
      </h2>
      <p className="inline-block self-stretch text-[#7e7e7e] text-sm">
        {token.metaData?.dataText}
      </p>
      {token.metaData?.mediaUrl && (
        <>
          <div
            className="max-w-xs max-h-[175px] rounded-lg cursor-pointer relative group"
            onClick={() =>
              openImageModal(token.metaData?.mediaUrl!, `${hostname} Preview`)
            }
          >
            <img
              src={token.metaData.mediaUrl}
              width={175}
              height={175}
              alt={`${hostname} Preview`}
              className="h-[175px] w-full rounded-lg object-cover border border-solid border-[#1919191a] transition-opacity group-hover:opacity-90"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-lg" />
          </div>
        </>
      )}
    </div>
  );
}

export default RenderLinkPreview;
