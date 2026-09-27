const messages = {
  storageRead: '저장된 상담을 읽지 못했어요. 기존 상담을 보호하고 있으니 다시 불러와 주세요.',
  storageWrite: '상담을 저장하지 못했어요. 입력과 뽑은 카드는 유지되니 다시 시도해 주세요.',
  invalidSaved: '저장된 상담 정보가 올바르지 않아요. 자동으로 삭제하지 않았으니 다시 불러오거나 직접 새로 시작해 주세요.',
  login: '토스 로그인을 완료하지 못했어요. 로그인 상태를 확인한 뒤 다시 시도해 주세요.',
  exchangeRejected: '토스 로그인 인증을 확인하지 못했어요. 다시 로그인해 주세요.',
  exchangeServer: '로그인 서버에 문제가 있어요. 잠시 후 다시 시도해 주세요.',
  exchangeNetwork: '로그인 서버에 연결하지 못했어요. 연결 상태를 확인하고 다시 시도해 주세요.',
  exchangeInvalid: '로그인 서버의 응답을 확인하지 못했어요. 다시 로그인해 주세요.',
  configuration: '상담 연결 주소를 확인하지 못했어요. 잠시 후 다시 시도해 주세요.',
  quota: '무료 심화 타로 상담 1회를 모두 사용했어요. 결제 후 새 상담을 이어갈 수 있어요.',
  missing: '저장된 상담을 찾지 못했어요. 잠시 후 다시 불러와 주세요.',
  request: '상담을 연결하지 못했어요. 저장된 내용을 다시 불러와 이어갈 수 있어요.',
  server: '상담 서버에 문제가 있어요. 저장된 내용을 유지하고 있으니 잠시 후 다시 시도해 주세요.',
  response: '상담 내용을 확인하지 못했어요. 다시 불러와 주세요.',
}

export class EntryError extends Error {
  constructor(stage) {
    super(messages[stage])
    this.stage = stage
  }
}
