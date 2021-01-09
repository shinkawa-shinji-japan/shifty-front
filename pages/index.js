import { useRouter } from "next/router";
import React from "react";
import BasicTable from "../src/components/BasicTable";
import ShiftTypesForm from "../src/components/ShiftTypesForm";
import AppHeader from "../src/components/AppHeader";

export default function Home() {
  const router = useRouter();
  const GOOGLE_CALENDAR_AUTH_CODE = router.query.code
    ? router.query.code
    : null;
  const [shiftTypes, setShiftTypes] = React.useState({
    1: {
      title: "早番",
      startTime: "11:30:00",
      endTime: "21:00:00",
      colorId: "2",
    },
    2: {
      title: "遅番",
      startTime: "13:30:00",
      endTime: "23:00:00",
      colorId: "10",
    },
  });
  const YEAR = 2021;
  const MONTH = 2;
  var data = {};

  React.useEffect(() => {
    // authCodeをアクセストークンに変換
    const getAccessToken = async (authCode) => {
      var url = "https://accounts.google.com/o/oauth2/token";
      var data = {
        client_id:
          "697184433971-mp8k45hsejd45k18gkltetn2fgh63rr3.apps.googleusercontent.com",
        client_secret: "K4ywtPu0NBG5MyBG533jOMH6",
        redirect_uri: "http://localhost:3000?event=insert",
        grant_type: "authorization_code",
        code: authCode,
      };
      const response = await fetch(url, {
        method: "POST",
        // mode: "cors",
        // cache: "no-cache",
        // credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
        },
        // redirect: "follow",
        // referrerPolicy: "no-referrer",
        body: JSON.stringify(data),
      });
      const responseJson = await response.json();
      return responseJson.access_token;
    };

    // アクセストークンを使ってカレンダーに登録
    const insertEvent = async (accessToken, data = {}) => {
      var url =
        "https://www.googleapis.com/calendar/v3/calendars/primary/events";
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      const responseJson = await response.json();
      return responseJson;
    };

    if (GOOGLE_CALENDAR_AUTH_CODE) {
      getAccessToken(GOOGLE_CALENDAR_AUTH_CODE).then(
        (accessToken) => {
          if (accessToken) {
            var workShifts = localStorage.getItem("work-shifts");
            if (workShifts) {
              workShifts = JSON.parse(workShifts);
            }
            var workShiftLength = Object.keys(workShifts).length;
            for (var iIndex = 1; iIndex < workShiftLength; iIndex++) {
              switch (workShifts[iIndex]) {
                case "1" /* 早番の時 */:
                  data = {
                    start: {
                      dateTime: `${YEAR}-${MONTH}-${iIndex}T${shiftTypes[1]["startTime"]}+09:00`,
                    },
                    end: {
                      dateTime: `${YEAR}-${MONTH}-${iIndex}T${shiftTypes[1]["endTime"]}+09:00`,
                    },
                    summary: shiftTypes[1]["title"],
                    colorId: shiftTypes[1]["colorId"],
                  };
                  insertEvent(accessToken, data);
                  // insertEvent(accessToken, data).then((value) => {
                  //   console.log(value);
                  // });
                  continue;
                case "2" /* 遅番の時 */:
                  data = {
                    start: {
                      dateTime: `${YEAR}-${MONTH}-${iIndex}T${shiftTypes[2]["startTime"]}+09:00`,
                    },
                    end: {
                      dateTime: `${YEAR}-${MONTH}-${iIndex}T${shiftTypes[2]["endTime"]}+09:00`,
                    },
                    summary: shiftTypes[2]["title"],
                    colorId: shiftTypes[2]["colorId"],
                  };
                  insertEvent(accessToken, data);
                  continue;
                case "0" /* 休みの時 */:
                  continue;
              }
            }
            router.push("/");
          }
        },
        (resolve) => {
          // console.log(resolve);
        }
      );
    }
  });

  React.useEffect(() => {
    var wbsSiftTypes = localStorage.getItem("shift-types");
    if (wbsSiftTypes) {
      wbsSiftTypes = JSON.parse(wbsSiftTypes);
      setShiftTypes(wbsSiftTypes);
    }
  }, []);

  React.useEffect(() => {
    localStorage.setItem("shift-types", JSON.stringify(shiftTypes));
    // console.log(localStorage.getItem("shift-types"));
  }, [shiftTypes]);

  const handleChangeShiftTypes = (event, label) => {
    if (event.target.name === "1") {
      if (label === "タイトル") {
        setShiftTypes({
          ...shiftTypes,
          [1]: { ...shiftTypes[1], title: event.target.value },
        });
      }
      if (label === "開始") {
        setShiftTypes({
          ...shiftTypes,
          [1]: { ...shiftTypes[1], startTime: event.target.value },
        });
      }
      if (label === "終了") {
        setShiftTypes({
          ...shiftTypes,
          [1]: { ...shiftTypes[1], endTime: event.target.value },
        });
      }
    }
    if (event.target.name === "2") {
      if (label === "タイトル") {
        setShiftTypes({
          ...shiftTypes,
          [2]: { ...shiftTypes[2], title: event.target.value },
        });
      }
      if (label === "開始") {
        setShiftTypes({
          ...shiftTypes,
          [2]: { ...shiftTypes[2], startTime: event.target.value },
        });
      }
      if (label === "終了") {
        setShiftTypes({
          ...shiftTypes,
          [2]: { ...shiftTypes[2], endTime: event.target.value },
        });
      }
    }
  };

  return (
    <div>
      <AppHeader>
        <ShiftTypesForm
          shiftTypes={JSON.stringify(shiftTypes)}
          handleChange={handleChangeShiftTypes}
        />
        <BasicTable
          year={YEAR}
          month={MONTH}
          shiftTypes={JSON.stringify(shiftTypes)}
          // onClickHandler={() => {
          //   localStorage.setItem("shift-types", JSON.stringify(shiftTypes));
          // }}
        />
      </AppHeader>
    </div>
  );
}