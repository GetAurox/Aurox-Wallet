import {
  Simulation,
  Revert,
  AssetChanges,
  ERC1155,
  ERC1155TransferSingle,
  ERC1155TransferBatch,
  ERC1155ApprovalForAll,
  ERC20,
  ERC20Transfer,
  ERC20Approval,
  ERC721,
  ERC721Approval,
  ERC721ApprovalForAll,
  ERC2309ConsecutiveTransfer,
} from "pocket-universe-js";

export function simulationIsRevert(simulation: Simulation): simulation is { revert: Revert } {
  return (simulation as { revert: Revert }).revert !== undefined;
}

export function simulationIsSuccess(simulation: Simulation): simulation is { success: AssetChanges } {
  return (simulation as { success: AssetChanges }).success !== undefined;
}

export function erc1155IsTransferSingle(erc1155: ERC1155): erc1155 is { transferSingle: ERC1155TransferSingle } {
  return (erc1155 as { transferSingle: ERC1155TransferSingle }).transferSingle !== undefined;
}

export function erc1155IsTransferBatch(erc1155: ERC1155): erc1155 is { transferBatch: ERC1155TransferBatch } {
  return (erc1155 as { transferBatch: ERC1155TransferBatch }).transferBatch !== undefined;
}

export function erc1155IsApprovalForAll(erc1155: ERC1155): erc1155 is { approvalForAll: ERC1155ApprovalForAll } {
  return (erc1155 as { approvalForAll: ERC1155ApprovalForAll }).approvalForAll !== undefined;
}

export function erc20IsTransfer(erc20: ERC20): erc20 is { transfer: ERC20Transfer } {
  return (erc20 as { transfer: ERC20Transfer }).transfer !== undefined;
}

export function erc20IsApproval(erc20: ERC20): erc20 is { approval: ERC20Approval } {
  return (erc20 as { approval: ERC20Approval }).approval !== undefined;
}

export function erc721IsTransfer(erc721: ERC721): erc721 is { transfer: ERC721Approval } {
  return (erc721 as { transfer: ERC721Approval }).transfer !== undefined;
}

export function erc721IsApproval(erc721: ERC721): erc721 is { approval: ERC721Approval } {
  return (erc721 as { approval: ERC721Approval }).approval !== undefined;
}

export function erc721IsApprovalForAll(erc721: ERC721): erc721 is { approvalForAll: ERC721ApprovalForAll } {
  return (erc721 as { approvalForAll: ERC721ApprovalForAll }).approvalForAll !== undefined;
}

export function erc721IsConsecutiveTransfer(erc721: ERC721): erc721 is { consecutiveTransfer: ERC2309ConsecutiveTransfer } {
  return (erc721 as { consecutiveTransfer: ERC2309ConsecutiveTransfer }).consecutiveTransfer !== undefined;
}
