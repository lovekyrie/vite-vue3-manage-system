function phoneValid(rule: any, value: any, callback: any) {
  if (!value) {
    return callback(new Error('手机号不能为空'))
  }
  else {
    // eslint-disable-next-line regexp/no-dupe-characters-character-class
    const reg = /^1[3|4|5|7|8]\d{9}$/
    if (reg.test(value)) {
      callback()
    }
    else {
      return callback(new Error('请输入正确的手机号码'))
    }
  }
}

export { phoneValid }
