import { Asset, Top, List, ListRow } from '@tds/mobile';
import { adaptive } from '@tds/colors';

export default function Page() {
  return (
    <>
      <>
        // 버튼으로 사용하는 경우 IconButton을 사용하거나 role="button"과
        aria-label 값을 작성해주세요
        <Asset.Icon
          frameShape={Asset.frameShape.CleanW24}
          backgroundColor="transparent"
          name="icon-arrow-back-ios-mono"
          color={adaptive.grey900}
          aria-hidden={true}
          ratio="1/1"
        />
      </>
      <Text color={adaptive.grey900} typography="t6" fontWeight="semibold">
        복냥사주
      </Text>
      <>
        // 버튼으로 사용하는 경우 IconButton을 사용하거나 role="button"과
        aria-label 값을 작성해주세요
        <Asset.Icon
          frameShape={Asset.frameShape.CleanW20}
          backgroundColor="transparent"
          name="icon-heart-mono"
          color={adaptive.greyOpacity600}
          aria-hidden={true}
          ratio="1/1"
        />
      </>
      <>
        // 버튼으로 사용하는 경우 IconButton을 사용하거나 role="button"과
        aria-label 값을 작성해주세요
        <Asset.Icon
          frameShape={Asset.frameShape.CleanW20}
          backgroundColor="transparent"
          name="icon-dots-mono"
          color={adaptive.greyOpacity600}
          aria-hidden={true}
          ratio="1/1"
        />
      </>
      <>
        // 버튼으로 사용하는 경우 IconButton을 사용하거나 role="button"과
        aria-label 값을 작성해주세요
        <Asset.Icon
          frameShape={Asset.frameShape.CleanW20}
          backgroundColor="transparent"
          name="icon-x-mono"
          color={adaptive.greyOpacity600}
          aria-hidden={true}
          ratio="1/1"
        />
      </>
      <>
        // 버튼으로 사용하는 경우 IconButton을 사용하거나 role="button"과
        aria-label 값을 작성해주세요
        <Asset.Image
          frameShape={Asset.frameShape.CleanW16}
          backgroundColor="transparent"
          src="https://static.toss.im/appsintoss/7011/eb6e95b2-de8d-4ca5-9025-662cfd7ece00.png"
          aria-hidden={true}
          style={{ aspectRatio: '1/1' }}
        />
      </>
      <Spacing size={14} />
      <Top
        title={
          <Top.TitleParagraph size={22} color={adaptive.grey900}>
            원하는 결과를 선택해 주세요
          </Top.TitleParagraph>
        }
      />
      <List>
        <ListRow
          contents={
            <ListRow.Texts
              type="2RowTypeA"
              top="사주로 보는 내 모습"
              topProps={{ color: adaptive.grey700, fontWeight: 'bold' }}
              bottom="내가 이렇게 예쁘다고?"
              bottomProps={{ color: adaptive.grey600 }}
            />
          }
          verticalPadding="large"
        />
        <ListRow
          contents={
            <ListRow.Texts
              type="2RowTypeA"
              top="내 사주의 동물상"
              topProps={{ color: adaptive.grey700, fontWeight: 'bold' }}
              bottom="내 사주를 닮은 동물은?"
              bottomProps={{ color: adaptive.grey600 }}
            />
          }
          verticalPadding="large"
        />
        <ListRow
          contents={
            <ListRow.Texts
              type="2RowTypeA"
              top="내 사주를 닮은 자연"
              topProps={{ color: adaptive.grey700, fontWeight: 'bold' }}
              bottom="내 사주를 자연으로 표현하면?"
              bottomProps={{ color: adaptive.grey600 }}
            />
          }
          verticalPadding="large"
        />
        <ListRow
          contents={
            <ListRow.Texts
              type="2RowTypeA"
              top="나를 살려주는 여행지"
              topProps={{ color: adaptive.grey700, fontWeight: 'bold' }}
              bottom="행운을 가져다 주는 여행지 알아보기"
              bottomProps={{ color: adaptive.grey600 }}
            />
          }
          verticalPadding="large"
        />
        <ListRow
          contents={
            <ListRow.Texts
              type="2RowTypeA"
              top="나만의 룩북"
              topProps={{ color: adaptive.grey700, fontWeight: 'bold' }}
              bottom="운을 좋게 해주는 나만의 패션 스타일"
              bottomProps={{ color: adaptive.grey600 }}
            />
          }
          verticalPadding="large"
        />
        <ListRow
          contents={
            <ListRow.Texts
              type="2RowTypeA"
              top="여행 룩북"
              topProps={{ color: adaptive.grey700, fontWeight: 'bold' }}
              bottom="나만을 위한 여행지와 패션을 한번에!"
              bottomProps={{ color: adaptive.grey600 }}
            />
          }
          verticalPadding="large"
        />
        <ListRow
          contents={
            <ListRow.Texts
              type="2RowTypeA"
              top="행운의 음식"
              topProps={{ color: adaptive.grey700, fontWeight: 'bold' }}
              bottom="내 운을 향상시켜 주는 음식"
              bottomProps={{ color: adaptive.grey600 }}
            />
          }
          verticalPadding="large"
        />
        <ListRow
          contents={
            <ListRow.Texts
              type="2RowTypeA"
              top="운명의 취미"
              topProps={{ color: adaptive.grey700, fontWeight: 'bold' }}
              bottom="내 운을 향상시켜 주는 취미는?"
              bottomProps={{ color: adaptive.grey600 }}
            />
          }
          verticalPadding="large"
        />
        <ListRow
          contents={
            <ListRow.Texts
              type="2RowTypeA"
              top="꿈의 직업"
              topProps={{ color: adaptive.grey700, fontWeight: 'bold' }}
              bottom="나를 살려주는 직업과 커리어 추천"
              bottomProps={{ color: adaptive.grey600 }}
            />
          }
          verticalPadding="large"
        />
      </List>
    </>
  );
}