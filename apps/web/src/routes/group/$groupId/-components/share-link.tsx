import { useTranslation } from "@repo/i18n";
import { useState } from "react";

interface ShareLinkProps { groupId: string; }

export function ShareLink({ groupId }: ShareLinkProps) {
  const { t } = useTranslation("groups");
  const { t: tc } = useTranslation("common");
  const [copied, setCopied] = useState(false);
  const url = `${window.location.origin}/group/${groupId}`;

  const handleCopy = async () => {
    try { await navigator.clipboard.writeText(url); } catch {
      const ta = document.createElement("textarea");
      ta.value = url;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="brutal-card p-3">
      <div className="flex items-center gap-2">
        <input
          value={url}
          readOnly
          className="input-brutal flex-1 text-sm"
          style={{ height: "40px" }}
          onClick={(e: React.MouseEvent<HTMLInputElement>) => (e.target as HTMLInputElement).select()}
        />
        <button
          onClick={handleCopy}
          className="btn-brutal text-xs py-2 px-4 whitespace-nowrap"
          style={{ background: copied ? "var(--lime)" : "var(--cyan)" }}
        >
          {copied ? t("shareLinkCopied") : tc("share")}
        </button>
      </div>
    </div>
  );
}
