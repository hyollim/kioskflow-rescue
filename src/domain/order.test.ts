import { describe, expect, it } from 'vitest';
import { getCartTotal,getUnitPrice,updateQuantity,validateOptions,formatWon,type CartItem } from './order';
const item:CartItem={id:'1',productId:'americano',temperature:'ICE',size:'Regular',quantity:2};
describe('order pricing and safe inputs',()=>{
 it('prices regular and large in KRW without rounding drift',()=>{expect(getUnitPrice(item)).toBe(3900);expect(getUnitPrice({...item,size:'Large'})).toBe(4400);expect(getCartTotal([item,{...item,id:'2',size:'Large',quantity:1}])).toBe(12200)});
 it('handles empty cart',()=>expect(getCartTotal([])).toBe(0));
 it('rejects unknown products and invalid sizes',()=>{expect(()=>getUnitPrice({...item,productId:'missing'})).toThrow();expect(()=>getUnitPrice({...item,size:'bad' as 'Large'})).toThrow()});
 it.each([0,-1,10,NaN,1.5])('rejects invalid quantity %s',n=>expect(()=>getCartTotal([{...item,quantity:n}])).toThrow());
 it('validates required temperature',()=>{expect(validateOptions({temperature:'',size:'Regular'})).toContain('온도');expect(validateOptions({temperature:'HOT',size:'Regular'})).toBeNull()});
 it('updates quantities immutably and bounds them',()=>{const original=[item];expect(updateQuantity(original,'1',99)[0].quantity).toBe(9);expect(updateQuantity(original,'1',-99)[0].quantity).toBe(1);expect(item.quantity).toBe(2);expect(()=>updateQuantity(original,'1',NaN)).toThrow()});
 it('formats won',()=>expect(formatWon(3900)).toBe('3,900원'));
});
