export interface BusinessInputs {devices:number;attemptsPerDevice:number;abandonRate:number;recoveryShare:number;marginPerOrder:number;staffRate:number;staffReduction:number;staffCost:number;monthlyFee:number;setupTotal:number;maintenanceTotal:number;falseRate:number;falseCost:number}
export const baseInputs:BusinessInputs={devices:10,attemptsPerDevice:3000,abandonRate:.1,recoveryShare:.2,marginPerOrder:1500,staffRate:.08,staffReduction:.2,staffCost:600,monthlyFee:45000,setupTotal:3000000,maintenanceTotal:80000,falseRate:.01,falseCost:100};
export const businessPresets:{id:string;label:string;description:string;inputs:BusinessInputs}[]=[
 {id:'base',label:'기준 가정',description:'가상의 10대 운영, 제한적 거래 회복',inputs:baseInputs},
 {id:'upside',label:'긍정적 가정',description:'이용량·회복률이 높고 통합비가 낮은 가정',inputs:{...baseInputs,devices:15,attemptsPerDevice:3500,recoveryShare:.3,monthlyFee:40000,setupTotal:2500000,falseRate:.005}},
 {id:'cautious',label:'보수적 가정',description:'소폭 회복, 긴 회수기간으로 추가 검증 필요',inputs:{...baseInputs,recoveryShare:.1,setupTotal:8000000,monthlyFee:35000,falseRate:.02}},
 {id:'downside',label:'부정적 가정',description:'낮은 회복과 높은 비용·오개입으로 도입 보류',inputs:{...baseInputs,recoveryShare:.05,monthlyFee:90000,setupTotal:12000000,maintenanceTotal:180000,falseRate:.22,falseCost:250}},
];
export const inputSpec:{key:keyof BusinessInputs;label:string;unit:string;max:number;percent?:boolean;step?:number;group:'volume'|'benefit'|'cost'}[]=[
 {key:'devices',label:'도입 기기 수',unit:'대',max:10000,step:1,group:'volume'},
 {key:'attemptsPerDevice',label:'기기당 월 거래 시도',unit:'건/대·월',max:100000,step:100,group:'volume'},
 {key:'abandonRate',label:'기존 주문 중단률',unit:'%',max:100,percent:true,group:'volume'},
 {key:'recoveryShare',label:'중단 거래 중 회복 비율',unit:'%',max:100,percent:true,group:'benefit'},
 {key:'marginPerOrder',label:'회복 거래당 공헌이익',unit:'원/건',max:1000000,step:100,group:'benefit'},
 {key:'staffRate',label:'기존 직원 지원 요청률',unit:'%',max:100,percent:true,group:'benefit'},
 {key:'staffReduction',label:'직원 요청 건수 감소율',unit:'%',max:100,percent:true,group:'benefit'},
 {key:'staffCost',label:'직원 지원 건당 비용',unit:'원/건',max:1000000,step:100,group:'benefit'},
 {key:'monthlyFee',label:'기기당 월 솔루션 이용료',unit:'원/대·월',max:10000000,step:5000,group:'cost'},
 {key:'setupTotal',label:'초기 설치·통합비 (전체)',unit:'원 · 일회성',max:10000000000,step:100000,group:'cost'},
 {key:'maintenanceTotal',label:'월 운영·유지비 (전체)',unit:'원/월',max:100000000,step:10000,group:'cost'},
 {key:'falseRate',label:'거래 시도 대비 오개입률',unit:'%',max:100,percent:true,group:'cost'},
 {key:'falseCost',label:'오개입 건당 추가 운영비',unit:'원/건',max:1000000,step:50,group:'cost'},
];
export function validateBusiness(v:BusinessInputs):string[]{const errors:string[]=[];for(const spec of inputSpec){const value=v[spec.key];const max=spec.percent?spec.max/100:spec.max;if(!Number.isFinite(value)||value<0||value>max)errors.push(`${spec.label}: 0~${spec.max.toLocaleString('ko-KR')}${spec.unit} 범위로 입력해 주세요.`)}if(!Number.isInteger(v.devices)||v.devices<1)errors.push('도입 기기 수는 1대 이상의 정수여야 합니다.');if(!Number.isInteger(v.attemptsPerDevice))errors.push('월 거래 시도는 정수로 입력해 주세요.');return errors}
export function calculateBusiness(v:BusinessInputs){const errors=validateBusiness(v);if(errors.length)throw new Error(errors.join(' '));const attempts=v.devices*v.attemptsPerDevice,baselineCompleted=attempts*(1-v.abandonRate),recovered=attempts*v.abandonRate*v.recoveryShare,recoveryProfit=recovered*v.marginPerOrder,beforeCalls=attempts*v.staffRate,afterCalls=beforeCalls*(1-v.staffReduction),staffSavings=(beforeCalls-afterCalls)*v.staffCost,subscription=v.devices*v.monthlyFee,falseCost=attempts*v.falseRate*v.falseCost,monthlyNet=recoveryProfit+staffSavings-subscription-v.maintenanceTotal-falseCost,beforeProfit=baselineCompleted*v.marginPerOrder-beforeCalls*v.staffCost,afterProfit=beforeProfit+monthlyNet,paybackMonths=monthlyNet>0?v.setupTotal/monthlyNet:null,roi12=v.setupTotal>0?(monthlyNet*12-v.setupTotal)/v.setupTotal:null;let recommendation:'소규모 실증 권고'|'실증 추가 필요'|'도입 보류'='소규모 실증 권고';const reasons:string[]=[];if(monthlyNet<=0){recommendation='도입 보류';reasons.push('월 순편익이 0 이하입니다.')}if(v.falseRate>=.2){recommendation='도입 보류';reasons.push('가정한 오개입률이 보류 기준 20% 이상입니다.')}if(recommendation!=='도입 보류'&&((paybackMonths!==null&&paybackMonths>12)||v.falseRate>=.1)){recommendation='실증 추가 필요';if(paybackMonths!==null&&paybackMonths>12)reasons.push('단순 회수기간이 12개월을 넘습니다.');if(v.falseRate>=.1)reasons.push('오개입률 10% 이상으로 개입 정책 검증이 필요합니다.')}if(!reasons.length)reasons.push('가상 손익 조건은 충족하지만 현장 데이터로 검증해야 합니다.');return {attempts,baselineCompleted,potentialCompleted:baselineCompleted+recovered,recovered,recoveryProfit,beforeCalls,afterCalls,staffSavings,subscription,falseCost,monthlyNet,beforeProfit,afterProfit,paybackMonths,roi12,annualNetAfterSetup:monthlyNet*12-v.setupTotal,recommendation,reasons}}
