import { Asset, Top, Menu, FixedBottomCTA, CTAButton } from '@tds/mobile';
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
            성별을 선택해 주세요
          </Top.TitleParagraph>
        }
      />
      <Menu.Trigger
        open={true}
        closeLabel="메뉴 닫기"
        dropdown={
          <Menu.Dropdown>
            <Menu.DropdownCheckItem checked={true}>여성</Menu.DropdownCheckItem>
            <Menu.DropdownCheckItem checked={false}>
              남성
            </Menu.DropdownCheckItem>
          </Menu.Dropdown>
        }
      >{`{/✱ Button을 추가해주세요 ✱/}`}</Menu.Trigger>
      <FixedBottomCTA.Double
        leftButton={
          <CTAButton color="dark" variant="weak" display="block">
            이전
          </CTAButton>
        }
        rightButton={<CTAButton display="block">다음</CTAButton>}
      />
    </>
  );
}