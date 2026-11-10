const { Top, TableRow, BoardRow, Post, BottomInfo, ListHeader, Border, Rating, Tooltip } = window.TDSMobileDesignSystem_7852d9;

function DetailScreen() {
  const [open, setOpen] = React.useState(0);
  const faq = [
    { q: '이자는 언제 들어오나요?', a: '매달 셋째 주 금요일에 지급돼요.' },
    { q: '중도 해지하면 어떻게 되나요?', a: '약정 이자 대신 중도해지 이율이 적용돼요.' },
  ];
  return (
    <div>
      <Top subTextTop="토스뱅크" title="자유적금" subTextBottom="매달 원하는 만큼 모아요" />
      <div style={{ padding: '0 24px 16px' }}><Tooltip size="S" placement="bottom">첫 달은 이자를 두 배로 드려요</Tooltip></div>
      <Border height="thick" />
      <ListHeader title="상품 정보" />
      <TableRow left="이자율" right="연 2.3%" />
      <TableRow left="가입기간" right="12개월" />
      <TableRow left="최소 금액" right="1,000원" />
      <TableRow left="예금자보호" right="5,000만원까지" />
      <Border height="thick" />
      <ListHeader title="고객 만족도" accessory={<Rating value={4} size="S" kind="compact" />} />
      <Post blocks={[
        { type: 'h3', text: '이런 분께 추천해요' },
        { type: 'unordered', items: ['매달 조금씩 모으고 싶은 분', '중도 인출 없이 목표를 지키고 싶은 분'] },
        { type: 'paragraph', text: '가입 후에도 납입 금액을 언제든 바꿀 수 있어요.', size: 'S' },
      ]} />
      <Border height="thick" />
      <ListHeader title="자주 묻는 질문" />
      {faq.map((r, i) => (
        <BoardRow key={i} question={r.q} answer={r.a} opened={open === i} onToggle={() => setOpen(open === i ? -1 : i)} />
      ))}
      <BottomInfo items={[
        '예금자보호법에 따라 보호됩니다.',
        '세부 조건은 상품설명서를 확인해주세요.',
        '이 광고는 준법감시인 심의를 거쳤어요.',
      ]} />
    </div>
  );
}
Object.assign(window, { DetailScreen });
