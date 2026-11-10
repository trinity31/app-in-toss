const { Top, ListRow, Switch, SegmentedControl, Checkbox, ListHeader, Border, Badge, Icon, TextButton, Loader } = window.TDSMobileDesignSystem_7852d9;

function SettingsScreen({ onMenu }) {
  const [push, setPush] = React.useState(true);
  const [face, setFace] = React.useState(false);
  const [theme, setTheme] = React.useState(0);
  const [agree, setAgree] = React.useState(true);
  const [busy, setBusy] = React.useState(false);
  return (
    <div>
      <Top title="설정" rightItem={<TextButton size="S" onClick={onMenu}>정렬</TextButton>} />
      <div style={{ padding: '0 0 12px' }}><SegmentedControl items={['라이트', '다크', '시스템']} value={theme} onChange={setTheme} size="S" /></div>
      <Border height="thick" />
      <ListHeader title="알림" />
      <ListRow title="푸시 알림" description="거래 내역과 혜택 소식" rightAccessory={<Switch checked={push} onChange={setPush} />} />
      <ListRow title="마케팅 수신" rightAccessory={<Switch checked={false} />} />
      <Border height="thick" />
      <ListHeader title="보안" />
      <ListRow title="얼굴 인증" rightAccessory={<Switch checked={face} onChange={setFace} />} />
      <ListRow title="비밀번호 변경" rightAccessory={<Icon name="IconArrowRightMonoArrow" size={24} style={{ color: 'var(--semantic-icon-quaternary)' }} />} />
      <ListRow title="기기 관리" rightText="3대" rightAccessory={<Badge size="XS" color="red">!</Badge>} />
      <Border height="thick" />
      <ListHeader title="약관" />
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 24px' }}>
        <Checkbox checked={agree} onChange={setAgree} />
        <span style={{ font: '400 15px/1.5 var(--tds-font-body)', color: 'var(--semantic-text-secondary)' }}>전체 약관에 동의해요</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', padding: '24px 0 32px' }}>
        {busy ? <Loader size="S" label="동기화 중이에요" /> : <TextButton appearance="arrow" color="neutral" onClick={() => { setBusy(true); setTimeout(() => setBusy(false), 1600); }}>데이터 동기화</TextButton>}
      </div>
    </div>
  );
}
Object.assign(window, { SettingsScreen });
