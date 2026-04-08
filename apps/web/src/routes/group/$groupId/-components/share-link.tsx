import { useTranslation } from "@repo/i18n";
import { Button, Card, CardContent, Input } from "@repo/ui";
import { useState } from "react";

interface ShareLinkProps {
  groupId: string;
}

export function ShareLink({ groupId }: ShareLinkProps) {
  const { t } = useTranslation("groups");
  const { t: tc } = useTranslation("common");
  const [copied, setCopied] = useState(false);

  const url = `${window.location.origin}/group/${groupId}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
      <CardContent className="p-3">
        <div className="flex items-center gap-2">
          <Input
            value={url}
            readOnly
            className="flex-1 bg-gray-50 text-sm text-gray-600"
            onClick={(e) => (e.target as HTMLInputElement).select()}
          />
          <Button
            onClick={handleCopy}
            className={`whitespace-nowrap transition-all ${
              copied
                ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                : "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
            }`}
          >
            {copied ? `\u2705 ${t("shareLinkCopied")}` : `\ud83d\udccb ${tc("share")}`}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
