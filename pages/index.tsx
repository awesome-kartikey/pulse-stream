import React, { useCallback, useState, useEffect } from "react";
import Image from "next/image";
import { useCurrentUser } from "@/hooks/user";
import { useCreateTweet, useGetAllTweets } from "@/hooks/tweet";
import { Tweet } from "@/gql/graphql";
import Twitterlayout from "@/components/FeedCard/Layout/TwitterLayout";
import { toast } from "react-hot-toast";
import FeedCard from "@/components/FeedCard";

// Correct Import: Use the GENERATED hook from your utility file
import { useUploadThing } from "@/utils/uploadthing";

type UploadFileResult = { key: string; url: string; name: string; size: number; };
interface HomeProps { tweets?: Tweet[]; }

export default function Home(props: HomeProps) {
  const { user } = useCurrentUser();
  const { data: tweetData, isLoading: isLoadingTweets } = useGetAllTweets();
  const { mutateAsync: createTweetMutate, isLoading: isCreatingTweet } = useCreateTweet();

  const [content, setContent] = useState("");
  const [imageURL, setImageURL] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  // --- Uploadthing Hook Setup (Using Generated Hook) ---
  // Correct Initialization: Pass endpoint key as FIRST argument, options as SECOND
  const { startUpload } = useUploadThing(
    "imageUploader", // <-- Endpoint key is the FIRST argument
    {               // <-- Options object is the SECOND argument
      onUploadProgress: (progress: number) => { console.log("Upload Progress:", progress); },
      onClientUploadComplete: (res?: UploadFileResult[]) => {
        setIsUploading(false);
        toast.dismiss('upload-toast');
        if (res && res.length > 0 && res[0].url) {
          const receivedUrl = res[0].url;
          console.log("!!! Frontend: Received Upload URL:", receivedUrl);
          setImageURL(receivedUrl);
          toast.success("Image uploaded!");
        } else {
          // --- Completed: Handle error/no URL ---
          console.error("!!! Frontend: Upload completed but no valid URL received:", res);
          toast.error("Upload succeeded but failed to get image URL.");
          setImageURL(""); // Ensure URL state is cleared
          // --- End Completion ---
        }
      },
      onUploadError: (error: Error) => {
        // --- Completed: Handle error ---
        setIsUploading(false); // Upload finished (with error)
        toast.dismiss('upload-toast'); // Dismiss the loading toast
        console.error("!!! Frontend: Upload Error:", error);
        toast.error(`Image upload failed: ${error.message}`);
        setImageURL(""); // Clear URL state on error
        // --- End Completion ---
      },
      onUploadBegin: (fileName: string) => {
        // --- Completed: Handle begin ---
        setIsUploading(true); // Mark upload as started
        setImageURL(""); // Clear any previous preview when starting a new upload
        console.log("!!! Frontend: Starting upload for:", fileName);
        toast.loading(`Uploading ${fileName}...`, { id: 'upload-toast' });
        // --- End Completion ---
        }
    }
  );

  // --- Callbacks ---
  const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0 && startUpload) {
       // Correct: Pass endpoint information as the SECOND argument to startUpload
      // because the hook itself wasn't initialized with a specific endpoint key.
      await startUpload(Array.from(files), { endpoint: "imageUploader" }); // <-- No endpoint needed here
    }
    event.target.value = '';
  }, [startUpload]);

  const handleCreateTweet = useCallback(async () => {
    const currentImageUrl = imageURL;
    const currentContent = content.trim();
    if ((!currentContent && !currentImageUrl) || isCreatingTweet || isUploading) {
      if (!currentContent && !currentImageUrl) toast.error("Cannot create an empty tweet.");
      return;
    }
    const payloadToSend = { content: currentContent, imageURL: currentImageUrl };
    console.log("!!! Frontend: Sending payload to GraphQL:", JSON.stringify(payloadToSend));
    try {
      await createTweetMutate(payloadToSend);
      setContent("");
      setImageURL("");
      toast.success("Tweet created!");
    } catch (error) {
      console.error("Failed to create tweet:", error);
    }
  }, [content, imageURL, isCreatingTweet, isUploading, createTweetMutate]);

  // --- Derived State & JSX ---
  const tweets = tweetData?.getAllTweets || props.tweets || [];
  const isTweetButtonDisabled = (!content.trim() && !imageURL) || isCreatingTweet || isUploading;

  return (
    <div>
      <Twitterlayout>
        <div>
          {/* --- Tweet Creation Area --- */}
          {user && (
             <div className="border border-r-0 border-l-0 border-b-0 border-gray-600 p-5 hover:bg-slate-900 transition-all">
              <div className="grid grid-cols-12 gap-3">
                {/* Avatar */}
                <div className="col-span-1">
                  {user.profileImageURL && (
                    <Image
                      src={user.profileImageURL}
                      alt={`${user.firstName || ''} ${user.lastName || ''}'s profile picture`}
                      width={50} height={50} className="rounded-full"
                    />
                  )}
                </div>
                {/* Input Area */}
                <div className="col-span-11">
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    disabled={isCreatingTweet || isUploading}
                    placeholder="What's happening?"
                    className="w-full bg-transparent text-xl px-3 border-b border-slate-700 focus:outline-none resize-none mb-2"
                    rows={3} maxLength={280}
                  />
                  {/* Image Preview */}
                  {imageURL && (
                    <div className="mt-3 relative w-fit">
                      <Image
                        src={imageURL} alt="tweet-image-preview"
                        width={300} height={300} className="rounded-lg object-contain max-h-[300px]"
                      />
                      <button
                        onClick={() => setImageURL("")} disabled={isCreatingTweet || isUploading}
                        className="absolute top-1 right-1 bg-black bg-opacity-60 text-white rounded-full p-1 text-xs leading-none hover:bg-opacity-80 focus:outline-none"
                        title="Remove image" aria-label="Remove image"
                      >✕</button>
                    </div>
                  )}
                  {/* Action Bar */}
                  <div className="mt-4 flex justify-between items-center">
                    <label htmlFor="file-input" className={`cursor-pointer text-xl p-2 rounded-full hover:bg-blue-900/50 transition-colors ${isUploading || isCreatingTweet ? 'opacity-50 cursor-not-allowed' : ''}`}>
                       🖼️ {/* Icon Placeholder */}
                    </label>
                    <input
                      id="file-input" type="file" className="hidden"
                      accept="image/png, image/jpeg, image/gif, image/webp"
                      onChange={handleFileChange} disabled={isUploading || isCreatingTweet}
                    />
                    <button
                      onClick={handleCreateTweet} disabled={isTweetButtonDisabled}
                      className="bg-[#1d9bf0] hover:bg-[#1a8cd8] font-semibold text-sm py-2 px-4 rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isCreatingTweet ? "Tweeting..." : isUploading ? "Uploading..." : "Tweet"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          {/* --- Display Tweets Feed --- */}
           {isLoadingTweets && !tweets.length && <div className="p-5 text-center text-gray-400">Loading tweets...</div>}
           {tweets?.map((tweet) => tweet?.id ? <FeedCard key={tweet.id} data={tweet as Tweet} /> : null)}
           {!isLoadingTweets && tweets.length === 0 && <div className="p-5 text-center text-gray-500">No tweets to see here yet!</div>}
        </div>
      </Twitterlayout>
    </div>
  );
}
// --- Optional getServerSideProps ---
/*
...
*/