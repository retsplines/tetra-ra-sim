import { expect, test } from 'vitest'
import { TDMATime } from './time'

test('tick correctly increments', () => {

    // Create a TDMATime instance at the beginning of time
    let time = new TDMATime();
    time.tick();
    expect(time.toTimestamp()).toBe(1);

    // Last slot of the first frame
    time = new TDMATime(4, 1, 1);
    time.tick();
    expect(time.getFrame()).toBe(2);

    // Last frame of the first multiframe
    time = new TDMATime(4, 18, 1);
    time.tick();
    expect(time.getMultiframe()).toBe(2);
});

test('isCLCH correctly identifies CLCH reserved slots', () => {

    // CLCH slots
    let time = new TDMATime(2, 18, 1);
    expect(time.isCLCH()).toBe(true);
    time = new TDMATime(1, 18, 2);
    expect(time.isCLCH()).toBe(true);
    time = new TDMATime(4, 18, 3);
    expect(time.isCLCH()).toBe(true);
    time = new TDMATime(3, 18, 4);
    expect(time.isCLCH()).toBe(true);

    // Not CLCH slots
    time = new TDMATime(1, 18, 1);
    expect(time.isCLCH()).toBe(false);
    time = new TDMATime(2, 18, 2);
    expect(time.isCLCH()).toBe(false);
    time = new TDMATime(3, 18, 3);
    expect(time.isCLCH()).toBe(false);
    time = new TDMATime(4, 18, 4);
    expect(time.isCLCH()).toBe(false);
    time = new TDMATime(3, 17, 4);
    expect(time.isCLCH()).toBe(false);

});

test('isControlFrame correctly identifies control frame (18)', () => {

    // Control frame
    let time = new TDMATime(1, 18, 1);
    expect(time.isControlFrame()).toBe(true);

    // Not control frame
    time = new TDMATime(1, 17, 1);
    expect(time.isControlFrame()).toBe(false);

});
