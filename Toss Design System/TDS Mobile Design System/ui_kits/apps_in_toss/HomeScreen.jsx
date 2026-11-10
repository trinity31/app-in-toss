const { Top, ListRow, GridList, BarChart, ListHeader, ListFooter, Border, Icon, Badge, Chip, Button } = window.TDSMobileDesignSystem_7852d9;

function HomeScreen({ go, toast }) {
  const [filter, setFilter] = React.useState(0);
  const filters = ['전체', '입금', '출금'];
  const tx = [
    { t: '스타벅스 강남점', d: '오늘 · 카드', a: '-5,800원', i: 'IconCoffeeMonoCoffeeStarbucks' },
    { t: '김토스', d: '어제 · 이체', a: '+120,000원', i: 'IconTransferMonoMoneyWon' },
    { t: '지하철', d: '어제 · 교통', a: '-1,450원', i: 'IconSubwayMonoSubwayTrain' },
  ];
  return (
    <div>
      <Top
        subTextTop="토스뱅크 통장"
        title="1,204,000원"
        subTextBottom="이자 받는 날까지 12일"
        rightItem={<Badge size="S" color="blue" variant="weak">연 2.3%</Badge>}
        lowerCTA={<>
          <Button size="M" variant="weak" color="neutral" onClick={() => toast('계좌번호가 복사되었습니다')} style={{ flex: 1 }}>계좌복사</Button>
          <Button size="M" onClick={() => go('transfer')} style={{ flex: 1 }}>송금</Button>
        </>}
      />
      <GridList columns={4} items={[
        { label: '송금', icon: <Icon name="IconTransferMonoMoneyWon" size={28} /> },
        { label: '카드', icon: <Icon name="IconCardMonoCard" size={28} /> },
        { label: '적금', icon: <Icon name="IconMoneyBagMonoMoney" size={28} /> },
        { label: '대출', icon: <Icon name="IconLoanBagMono" size={28} /> },
      ]} />
      <div style={{ height: 8 }} />
      <Border height="thick" />
      <ListHeader title="이번 달 소비" subText="8월" />
      <BarChart values={[30, 55, 40, 90, 60, 75]} highlight={5} labels={['3월','4월','5월','6월','7월','8월']} />
      <div style={{ height: 16 }} />
      <Border height="thick" />
      <ListHeader title="거래 내역" accessory={<span style={{ display: 'inline-flex', gap: 6 }}>
        {filters.map((x, i) => <Chip key={i} size="S" selected={i === filter} onClick={() => setFilter(i)}>{x}</Chip>)}
      </span>} />
      {tx.map((r, i) => (
        <ListRow key={i} onClick={() => go('detail')}
          leftAccessory={<span style={{ color: 'var(--semantic-icon-secondary)' }}><Icon name={r.i} size={30} /></span>}
          title={r.t} description={r.d} rightText={r.a} />
      ))}
      <ListFooter onClick={() => go('detail')}>더보기</ListFooter>
      <div style={{ height: 24 }} />
    </div>
  );
}
Object.assign(window, { HomeScreen });
