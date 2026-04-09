import { useTranslation } from "@repo/i18n";
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
    } catch {
      const textArea = document.createElement("textarea");
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="card-surface p-3">
      <div className="flex items-center gap-2">
        <input
          value={url}
          readOnly
          className="input-field flex-1 text-sm"
          style={{ background: "var(--color-cream)", color: "var(--color-slate)", height: "40px" }}
          onClick={(e: React.MouseEvent<HTMLInputElement>) => (e.target as HTMLInputElement).select()}
        />
        <button
          onClick={handleCopy}
          className="text-sm font-semibold px-4 py-2 rounded-lg whitespace-nowrap transition-all"
          style={{
            background: copied ? "var(--color-sage)" : "var(--color-charcoal)",
            color: "white",
          }}
        >
          {copied ? t("shareLinkCopied") : tc("share")}
        </button>
      </div>
    </div>
  );
}
