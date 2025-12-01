import {
  Asset,
  Top,
  TextField,
  TextFieldClearable,
  FixedBottomCTA,
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
          name="icon-arrow-back-ios-mono"
          color="#191F28ff"
          aria-hidden={true}
        />
      </>
      <Text color="#191F28ff" typography="t6" fontWeight="semibold">
        AI프로필스튜디오
      </Text>
      <>
        // 버튼으로 사용하는 경우 IconButton을 사용하거나 role="button"과
        aria-label 값을 작성해주세요
        <Asset.Icon
          frameShape={Asset.frameShape.CleanW20}
          name="icon-dots-mono"
          color="rgba(0, 19, 43, 0.58)"
          aria-hidden={true}
        />
      </>
      <>
        // 버튼으로 사용하는 경우 IconButton을 사용하거나 role="button"과
        aria-label 값을 작성해주세요
        <Asset.Icon
          frameShape={Asset.frameShape.CleanW20}
          name="icon-x-mono"
          color="rgba(0, 19, 43, 0.58)"
          aria-hidden={true}
        />
      </>
      <>
        // 버튼으로 사용하는 경우 IconButton을 사용하거나 role="button"과
        aria-label 값을 작성해주세요
        <Asset.Image
          frameShape={Asset.frameShape.CleanW16}
          src="https://static.toss.im/appsintoss/7011/38bc18e7-84fa-4ed5-b902-4165ddc83795.png"
          aria-hidden={true}
        />
      </>
      <Spacing size={14} />
      <Top
        title={
          <Top.TitleParagraph size={22} color={adaptive.grey900}>
            이름을 입력해주세요
          </Top.TitleParagraph>
        }
      />
      {/* 숫자키패드 사용을 위해서는 type="number" 대신 inputMode="numeric"를 사용해주세요. */}
      <TextField.Clearable
        variant="line"
        hasError={false}
        label=""
        labelOption="sustain"
        value=""
        placeholder=" 이름 또는 닉네임"
      />
      <FixedBottomCTA.Single>확인</FixedBottomCTA.Single>
    </>
  );
}