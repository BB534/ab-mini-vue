export const enum shapeFlags {
  ELEMENT = 1, // 0001
  STATEFUL_COMPONENT = 1 << 1, // 0010 
  TEXT_CHILDREN = 1 << 2, // 0100
  ARRAY_CHILDREN = 1 << 3 // 1000
}

/***
 * 高效的位运算表达方式
 * 0000
 * 0001 -> element
 * 0010 -> stateful
 * 0100 -> text_children
 * 1000 -> array_children
 * | (当两位都为0时才为0)
 * & （当两位都为1时才为1） 
 * ^ （两位如果有一位为1则都为1）
 * 所以修改就为
 * 0000 | 0001 -> element -> 0001
 */