const { Top, Keypad, BottomCTA, Button, ListRow, Icon, Border, ProgressStepper } = window.TDSMobileDesignSystem_7852d9;

function TransferScreen({ go, openSheet, account }) {
  const [amount, setAmount] = React.useState('');
  const pretty = amount ? Number(amount).toLocaleString('ko-KR') + '원' : '얼마를 보낼까요?';
  const key = (k) => setAmount(a => k === '⌫' ? a.slice(0, -1) : (a + k).replace(/^0+/, '').slice(0, 9));
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <ProgressStepper steps={3} current={1} labels={['받는 사람', '금액', '확인']} />
      <Top title={<span style={{ color: amount ? 'var(--semantic-text-primary)' : 'var(--semantic-text-quaternary)' }}>{pretty}</span>} subTextBottom={`${account} · 잔액 1,204,000원`} />
      <Border />
      <ListRow onClick={openSheet}
        leftAccessory={<span style={{ color: 'var(--semantic-icon-secondary)' }}><Icon name="IconBankToss" size={30} /></span>}
        title="김토스" description="토스뱅크 1002-345-678901"
        rightAccessory={<Icon name="IconArrowRightMonoArrow" size={24} style={{ color: 'var(--semantic-icon-quaternary)' }} />} />
      <div style={{ flex: 1 }} />
      <Keypad onKey={key} />
      <div style={{ paddingBottom: 16 }}>
        <BottomCTA>
          <Button size="XL" fullWidth disabled={!amount} onClick={() => go('done')}>보내기</Button>
        </BottomCTA>
      </div>
    </div>
  );
}
Object.assign(window, { TransferScreen });
