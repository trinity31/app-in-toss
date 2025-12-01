import {
  Asset,
  Top,
  TextField,
  textFieldFormat,
  TextFieldClearable,
  FixedBottomCTA,
  CTAButton,
} from '@tds/mobile';
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
            생년월일을 입력해 주세요
          </Top.TitleParagraph>
        }
      />
      {/* 숫자키패드 사용을 위해서는 type="number" 대신 inputMode="numeric"를 사용해주세요. */}
      <TextField.Clearable
        variant="box"
        hasError={false}
        label="연"
        labelOption="sustain"
        value=""
        placeholder="1995"
        format="{textFieldFormat.price}"
        type="tel"
      />
      {/* 숫자키패드 사용을 위해서는 type="number" 대신 inputMode="numeric"를 사용해주세요. */}
      <TextField.Clearable
        variant="box"
        hasError={false}
        label="월"
        labelOption="sustain"
        value=""
        placeholder="9"
        format="{textFieldFormat.price}"
        type="tel"
      />
      {/* 숫자키패드 사용을 위해서는 type="number" 대신 inputMode="numeric"를 사용해주세요. */}
      <TextField.Clearable
        variant="box"
        hasError={false}
        label="일"
        labelOption="sustain"
        value="12"
        placeholder="{금액/이름/주소 등} 입력"
        format="{textFieldFormat.price}"
        type="tel"
      />
      <Spacing size={32} />
      <Top
        title={
          <Top.TitleParagraph size={22} color={adaptive.grey900}>
            태어난 시간을 입력해 주세요
          </Top.TitleParagraph>
        }
        subtitleBottom={
          <Top.SubtitleParagraph>모르면 비워두세요</Top.SubtitleParagraph>
        }
      />
      {/* 숫자키패드 사용을 위해서는 type="number" 대신 inputMode="numeric"를 사용해주세요. */}
      <TextField.Clearable
        variant="box"
        hasError={false}
        label="시간"
        labelOption="sustain"
        value=""
        placeholder="18"
        format="{textFieldFormat.price}"
        type="tel"
      />
      {/* 숫자키패드 사용을 위해서는 type="number" 대신 inputMode="numeric"를 사용해주세요. */}
      <TextField.Clearable
        variant="box"
        hasError={false}
        label="분"
        labelOption="sustain"
        value=""
        placeholder="31"
        format="{textFieldFormat.price}"
        type="tel"
      />
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