import React, { useEffect } from "react";
import { QRCodeSVG } from 'qrcode.react';
import useStore from "../../../lib/ZustStore";


function QrCode() {
  const { pageInfo } = useStore((state) => state);


  return (
    <>
      <QRCodeSVG
        id="qrCodeEl"
        value={`${process.env.VITE_APP_VIEW}${pageInfo.link}`}
        size={128}
        bgColor={"#ffffff"}
        fgColor={"#000000"}
        level={"L"}
        includeMargin={false}
      />
    </>
  );
}

export default QrCode;
