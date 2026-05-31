import type { CmsBlockNode } from '@/lib/blocks/block-types';

export type BlockPath = number[];

export function cloneBlockTree<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function getChildren(tree: CmsBlockNode[], path: BlockPath) {
  let current: CmsBlockNode[] = tree;
  for (const index of path.slice(0, -1)) {
    const node = current[index];
    if (!node || node.type !== 'container') return null;
    current = node.children || [];
  }
  return current;
}

function getNode(tree: CmsBlockNode[], path: BlockPath) {
  const children = getChildren(tree, path);
  if (!children) return null;
  const index = path[path.length - 1] ?? -1;
  return { children, index, node: children[index] };
}

export function moveBlock(tree: CmsBlockNode[], from: BlockPath, to: BlockPath, position: 'before' | 'after' | 'inside') {
  const draft = cloneBlockTree(tree);
  const fromLocation = getNode(draft, from);
  if (!fromLocation?.node) return draft;
  const [node] = fromLocation.children.splice(fromLocation.index, 1);
  const toLocation = getNode(draft, to);
  if (!toLocation) return tree;
  if (position === 'inside') {
    const target = toLocation.node;
    if (!target || target.type !== 'container') return tree;
    target.children = target.children || [];
    target.children.push(node);
    return draft;
  }
  const sameParent = fromLocation.children === toLocation.children;
  let insertIndex = position === 'before' ? toLocation.index : toLocation.index + 1;
  if (sameParent && fromLocation.index < insertIndex) insertIndex -= 1;
  toLocation.children.splice(insertIndex, 0, node);
  return draft;
}

export function replaceBlock(tree: CmsBlockNode[], path: BlockPath, updater: (node: CmsBlockNode) => CmsBlockNode) {
  const draft = cloneBlockTree(tree);
  const location = getNode(draft, path);
  if (!location?.node) return tree;
  location.children[location.index] = updater(location.node);
  return draft;
}

export function removeBlock(tree: CmsBlockNode[], path: BlockPath) {
  const draft = cloneBlockTree(tree);
  const location = getNode(draft, path);
  if (!location?.node) return tree;
  location.children.splice(location.index, 1);
  return draft;
}

export function insertBlock(tree: CmsBlockNode[], path: BlockPath, node: CmsBlockNode, position: 'before' | 'after' = 'after') {
  const draft = cloneBlockTree(tree);
  const location = getNode(draft, path);
  if (!location?.node) return tree;
  const index = position === 'before' ? location.index : location.index + 1;
  location.children.splice(index, 0, node);
  return draft;
}

export function appendBlock(tree: CmsBlockNode[], node: CmsBlockNode) {
  return [...cloneBlockTree(tree), node];
}

export function wrapLastSiblingInContainer(tree: CmsBlockNode[], path: BlockPath, node: CmsBlockNode) {
  const draft = cloneBlockTree(tree);
  const location = getNode(draft, path);
  if (!location?.node || !location.index) return tree;
  const parent = location.children;
  const previous = parent[location.index - 1];
  if (!previous || previous.type !== 'container') return tree;
  previous.children = previous.children || [];
  previous.children.push(node);
  return draft;
}

export function outdentBlock(tree: CmsBlockNode[], path: BlockPath) {
  if (path.length < 2) return tree;
  const draft = cloneBlockTree(tree);
  const parentPath = path.slice(0, -1);
  const parentLocation = getNode(draft, parentPath);
  const currentLocation = getNode(draft, path);
  if (!parentLocation?.node || !currentLocation?.node) return tree;
  const [node] = currentLocation.children.splice(currentLocation.index, 1);
  const grandParent = parentPath.slice(0, -1);
  const grandLocation = grandParent.length ? getNode(draft, grandParent) : null;
  const insertIndex = grandLocation ? (grandLocation.children.indexOf(parentLocation.node) + 1) : parentLocation.index + 1;
  if (grandLocation) {
    grandLocation.children.splice(insertIndex, 0, node);
  } else {
    draft.splice(parentLocation.index + 1, 0, node);
  }
  return draft;
}

export function indentBlock(tree: CmsBlockNode[], path: BlockPath) {
  if (path.length < 1) return tree;
  const draft = cloneBlockTree(tree);
  const location = getNode(draft, path);
  if (!location?.node || location.index === 0) return tree;
  const previous = location.children[location.index - 1];
  if (!previous || previous.type !== 'container') return tree;
  previous.children = previous.children || [];
  const [node] = location.children.splice(location.index, 1);
  previous.children.push(node);
  return draft;
}

export function duplicateBlock(tree: CmsBlockNode[], path: BlockPath) {
  const location = getNode(tree, path);
  if (!location?.node) return tree;
  return insertBlock(tree, path, cloneBlockTree(location.node), 'after');
}

export function getBlockAtPath(tree: CmsBlockNode[], path: BlockPath): CmsBlockNode | null {
  const location = getNode(tree, path);
  return location?.node || null;
}
