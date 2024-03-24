export interface Sport {
  lotteryID: string;
  lotteryName: string;
  groups: SportGroup[];
}

export interface SportGroup {
  groupID: string;
  groupName: string;
  matches: SportGroupMatch[];
}

export interface SportGroupMatch {
  id: string;
  lotteryID: string;
  lotteryName: string;
  lotteryGroupName: string;
  issueNO: string;
  isSingle: number;
  endTime: string;
  openTime: string;
  handicap: string;
  oddsGroups: SportGroupMatchOdds[];
}

export interface SportGroupMatchOdds {
  oddsGroupName: string;
  oddsConfigs: SportGroupMatchOddsConfig[];
}

export interface SportGroupMatchOddsConfig {
  oddsCode: string;
  oddsName: string;
  odds: number;
  checked?: boolean; // 前端用
}
