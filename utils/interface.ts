import type { Permission } from "~/types/menu";
import { CanvassingStatus, type Canvassing } from "~/types/scm/canvasing";

export const wrapUniqueCode = (unique: string) => {
  const split = unique.split("/");
  return `${split[0]}...${split[split.length - 1]}`;
};

export const generateRABInfo = (privilages: Permission[], data: Canvassing) => {
  let text = "";
  if (data.status == CanvassingStatus.PENDING_APPROVAL) {
    text = "RAB telah di ajukan, dan sedang menunggu approval!";
    if (data.status_check == "pending") {
      text = text + "dan pengecekan!";
    } else if (data.status_check == "progress") {
      text = "RAB sedang dilakukan pengecekan";
      text = text + "dan menunggu approval!";
    } else if (data.status_check == "completed") {
      text = "RAB telah selesai pengecekan";
      text = text + "tinggal menunggu approval!";
    }
  } else if (data.status == CanvassingStatus.DONE) {
    text = "RAB telah disetujui";
    if (data.status_check == "pending") {
      text = text + ", tinggal menunggu pengecekan!";
    } else if (data.status_check == "progress") {
      text = "RAB telah disetujui, dan sedang dilakukan pengecekan!";
    } else if (data.status_check == "completed") {
      text = text + "dan telah selesai pengecekan!";
    }
  }

  return text;
};
