import React, { useEffect, useState, ReactNode } from 'react';
import { withResizeDetector } from 'react-resize-detector';
import styled from 'styled-components';

const defaultSplit: [number, number] = [1, 1];
const targetRatio = 4 / 3;

interface Props {
  splitNum: number;
  children: ReactNode;
  width: number;
  height: number;
}
const AutoSpliter = ({ splitNum, children, width, height }: Props) => {
  const [[vertical, horizontal], setSplit] = useState<[number, number]>(defaultSplit);

  useEffect(() => {
    setSplit(calcSplit(targetRatio, splitNum, width, height));
  }, [splitNum, width, height]);

  return (
    <Spliter vertical={vertical} horizontal={horizontal}>
      {children}
    </Spliter>
  );
};

const Spliter = styled.div<{ horizontal: number; vertical: number }>`
  width: 100%;
  height: 100%;
  display: grid;
  grid-template-rows: repeat(${({ horizontal }) => horizontal}, 1fr);
  grid-template-columns: repeat(${({ vertical }) => vertical}, 1fr);
`;

const calcSplit = (targetRatio: number, splitNum: number, width: number, height: number): [number, number] => {
  let horizontal = 1;
  let vertical = 1;
  while (horizontal * vertical < splitNum) {
    const splitWidth = width / vertical;
    const splitHeight = height / horizontal;
    const currentRatio = splitWidth / splitHeight;
    if (targetRatio > currentRatio) {
      horizontal++;
    } else {
      vertical++;
    }
  }
  return [vertical, horizontal];
};

export default withResizeDetector<Props>(AutoSpliter);
