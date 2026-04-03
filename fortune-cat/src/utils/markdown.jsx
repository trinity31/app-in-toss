// CommonMark에서 **text** 뒤에 바로 한글이 오면 bold 파싱 실패
// **'문서'**가 → **'문서'** 가 (공백 추가)
export const normalizeMarkdown = (text) => {
  if (!text) return "";
  return (
    text
      // ** text** → **text** (여는 ** 뒤 공백 제거)
      .replace(/\*\*\s+(.+?)\*\*/g, "**$1**")
      // **text**가 → **text** 가 (닫는 ** 뒤 비공백 앞에 공백 추가)
      .replace(/\*\*(.+?)\*\*(?=\S)/g, "**$1** ")
  );
};

export const markdownComponents = {
  h2: ({ node, ...props }) => (
    <h2
      style={{
        fontSize: "17px",
        fontWeight: "bold",
        color: "var(--color-primary)",
        marginTop: "20px",
        marginBottom: "10px",
        lineHeight: "1.4",
      }}
      {...props}
    />
  ),
  h3: ({ node, ...props }) => (
    <h3
      style={{
        fontSize: "16px",
        fontWeight: "600",
        color: "var(--color-gray-700)",
        marginTop: "16px",
        marginBottom: "8px",
        lineHeight: "1.4",
      }}
      {...props}
    />
  ),
  p: ({ node, ...props }) => (
    <p
      style={{
        marginBottom: "12px",
        lineHeight: "1.8",
      }}
      {...props}
    />
  ),
  ul: ({ node, ...props }) => (
    <ul
      style={{
        paddingLeft: "20px",
        marginBottom: "12px",
      }}
      {...props}
    />
  ),
  ol: ({ node, ...props }) => (
    <ol
      style={{
        paddingLeft: "20px",
        marginBottom: "12px",
      }}
      {...props}
    />
  ),
  li: ({ node, ...props }) => (
    <li
      style={{
        marginBottom: "6px",
        lineHeight: "1.7",
      }}
      {...props}
    />
  ),
  strong: ({ node, ...props }) => (
    <strong
      style={{
        fontWeight: "700",
        color: "var(--color-gray-700)",
      }}
      {...props}
    />
  ),
  em: ({ node, ...props }) => (
    <em
      style={{
        fontStyle: "italic",
        color: "var(--color-primary)",
      }}
      {...props}
    />
  ),
};
