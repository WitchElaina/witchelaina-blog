---
title: Bomblab拆弹实验
tags: ["C++", "汇编"]
category: 记录
excerpt: C++课程实验之一, 使用gdb调试程序, 查看反汇编代码寻找答案, 本文记录了实验过程及一些问题的巧妙解法
date: "2021-11-18T00:00:00.000Z"
author:
  name: WitchElaina
  picture: "/assets/blog/authors/witchelaina.jpeg"
coverImage: "/assets/articles/bomb_defusion/cover.png"
ogImage:
  url: "/assets/articles/bomb_defusion/cover.png"
---

## 前期准备

### 安装 gdb-peda 插件

首先使用`tar -xvf 42024203.tar`解压压缩包，然后使用 `gdb ./work/bomb `指令用`gdb`打开二进制可执行文件`bomb`

## Phase 0

获取 phase0 的汇编代码：

```shell
gdb-peda$ disassemble phase_0
```

```avrasm
Dump of assembler code for function phase_0:
   0x08049580 <+0>:     endbr32
   0x08049584 <+4>:     push   ebp
   0x08049585 <+5>:     mov    ebp,esp
   0x08049587 <+7>:     sub    esp,0x8
   0x0804958a <+10>:    sub    esp,0x8
   0x0804958d <+13>:    push   0x804b1c8	# 推入0x804b1c8处的字符串
   0x08049592 <+18>:    push   DWORD PTR [ebp+0x8]	# 推入用户输入的字符串
   0x08049595 <+21>:    call   0x8049df1 <strings_not_equal>	# 调用字符串比较函数比较两字符串是否相等
   0x0804959a <+26>:    add    esp,0x10
   0x0804959d <+29>:    test   eax,eax	# 判断strings_not_equal函数的返回值, 将eax与自身进行与运算，得到返回值1或0
   0x0804959f <+31>:    je     0x80495ad <phase_0+45>	# 如果不是0跳转至0x80495ad处的指令，结束phase_0,拆弹成功
   0x080495a1 <+33>:    call   0x804a071 <explode_bomb>	# 如果是0则不跳转，引爆炸弹
   0x080495a6 <+38>:    mov    eax,0x0		# 将phase_0函数return 0;
   0x080495ab <+43>:    jmp    0x80495b2 <phase_0+50>
   0x080495ad <+45>:    mov    eax,0x1		# 将phase_0函数return 1;
   0x080495b2 <+50>:    leave
   0x080495b3 <+51>:    ret
End of assembler dump.
```

分析可得只需要查看`0x804b1c8`处字符串的值即可获得`phase_0`的答案

```shell
gdb-peda$ x/s 0x804b1c8
0x804b1c8:      "Why index with the middle bits?"
```

查询可得正确结果`Why index with the middle bits?`

## Phase 1

获取 phase1 的汇编代码：

```shell
gdb-peda$ disassemble phase_1
```

```avrasm
Dump of assembler code for function phase_1:
   0x080495b4 <+0>:     endbr32
   0x080495b8 <+4>:     push   ebp
   0x080495b9 <+5>:     mov    ebp,esp
   0x080495bb <+7>:     sub    esp,0x38
   0x080495be <+10>:    mov    eax,DWORD PTR [ebp+0x8]
   0x080495c1 <+13>:    mov    DWORD PTR [ebp-0x2c],eax
   0x080495c4 <+16>:    mov    eax,gs:0x14
   0x080495ca <+22>:    mov    DWORD PTR [ebp-0xc],eax
   0x080495cd <+25>:    xor    eax,eax
   0x080495cf <+27>:    mov    DWORD PTR [ebp-0x1c],0x2009dd99	#将整数0x2009dd99推入浮点计数器中
   0x080495d6 <+34>:    fild   DWORD PTR [ebp-0x1c]
   0x080495d9 <+37>:    fstp   QWORD PTR [ebp-0x18]	# 将浮点计数器中的数存储到寄存器中，地址为ebp-0x18
   0x080495dc <+40>:    lea    eax,[ebp-0x20]
   0x080495df <+43>:    push   eax
   0x080495e0 <+44>:    lea    eax,[ebp-0x24]
   0x080495e3 <+47>:    push   eax
   0x080495e4 <+48>:    push   0x804b1e8	# sscanf读取的输入格式，查看内容可得%d %d，即输入为两个用空格分开的整数
   0x080495e9 <+53>:    push   DWORD PTR [ebp-0x2c]
   0x080495ec <+56>:    call   0x80491f0 <__isoc99_sscanf@plt>
   0x080495f1 <+61>:    add    esp,0x10
   0x080495f4 <+64>:    cmp    eax,0x2	# 将输入的数字数量与0x2作比较，如果相等则跳转，不相等则爆炸，即必须输入两个整数
   0x080495f7 <+67>:    je     0x8049605 <phase_1+81> # 跳转
   0x080495f9 <+69>:    call   0x804a071 <explode_bomb>	# 引爆炸弹
   0x080495fe <+74>:    mov    eax,0x0
   0x08049603 <+79>:    jmp    0x8049631 <phase_1+125>
   0x08049605 <+81>:    lea    eax,[ebp-0x18]
   0x08049608 <+84>:    mov    edx,DWORD PTR [eax]
   0x0804960a <+86>:    mov    eax,DWORD PTR [ebp-0x24]
   0x0804960d <+89>:    cmp    edx,eax	# 比较第一个输入数和此时eax中的数是否相等，不相等则爆炸，相等则继续
   0x0804960f <+91>:    jne    0x8049620 <phase_1+108>
   0x08049611 <+93>:    lea    eax,[ebp-0x18]
   0x08049614 <+96>:    add    eax,0x4
   0x08049617 <+99>:    mov    edx,DWORD PTR [eax]
   0x08049619 <+101>:   mov    eax,DWORD PTR [ebp-0x20]
   0x0804961c <+104>:   cmp    edx,eax	# 比较第二个输入数和此时eax中的数是否相等，不相等则爆炸，相等则结束phase_1，拆弹成功
   0x0804961e <+106>:   je     0x804962c <phase_1+120>
   0x08049620 <+108>:   call   0x804a071 <explode_bomb># 引爆炸弹
   0x08049625 <+113>:   mov    eax,0x0
   0x0804962a <+118>:   jmp    0x8049631 <phase_1+125>
   0x0804962c <+120>:   mov    eax,0x1
   0x08049631 <+125>:   mov    ecx,DWORD PTR [ebp-0xc]
   0x08049634 <+128>:   xor    ecx,DWORD PTR gs:0x14
   0x0804963b <+135>:   je     0x8049642 <phase_1+142>
   0x0804963d <+137>:   call   0x8049190 <__stack_chk_fail@plt>
   0x08049642 <+142>:   leave
   0x08049643 <+143>:   ret
End of assembler dump.
```

编写以下 C++代码，模拟程序执行的过程

```cpp
double value=0x2009dd99;		//传入浮点寄存器中的数值
    int* res=new int [2];
    res=(int *)&value;				//获取两处地址，进行强制类型转换，以整数方式强制打印，即可得到结果
cout<<res[0]<<" "<<res[1]<<endl;
```

运行上述程序，得到答案
`-864026624 1103103214`

## Phase 2

输入`disassemble phase_2`获取 phase2 的汇编代码：

```shell
gdb-peda$ disassemble phase_2
```

```avrasm
Dump of assembler code for function phase_2:
   0x08049644 <+0>:     endbr32
   0x08049648 <+4>:     push   ebp
   0x08049649 <+5>:     mov    ebp,esp
   0x0804964b <+7>:     sub    esp,0x48
   0x0804964e <+10>:    mov    eax,DWORD PTR [ebp+0x8]
   0x08049651 <+13>:    mov    DWORD PTR [ebp-0x3c],eax
   0x08049654 <+16>:    mov    eax,gs:0x14
   0x0804965a <+22>:    mov    DWORD PTR [ebp-0xc],eax
   0x0804965d <+25>:    xor    eax,eax
   0x0804965f <+27>:    sub    esp,0x4
   0x08049662 <+30>:    push   0x8	# 结合后面的函数read_n_numbers可知，程序读取了0x8个数，即我们需要输入8个整数
   0x08049664 <+32>:    lea    eax,[ebp-0x2c]
   0x08049667 <+35>:    push   eax
   0x08049668 <+36>:    push   DWORD PTR [ebp-0x3c]
   0x0804966b <+39>:    call   0x8049d2f <read_n_numbers>
   0x08049670 <+44>:    add    esp,0x10
   0x08049673 <+47>:    test   eax,eax	# 检验是否输入了正确数量的数，如果read_n_numbers返回0，表示没有读取到正确数量的数，程序跳转爆炸
   0x08049675 <+49>:    jne    0x804967e <phase_2+58>
   0x08049677 <+51>:    mov    eax,0x0
   0x0804967c <+56>:    jmp    0x80496e3 <phase_2+159>
   0x0804967e <+58>:    mov    eax,DWORD PTR [ebp-0x2c]
   0x08049681 <+61>:    cmp    eax,0x20		# 判断第一个输入数是否为0x20(十进制32)，如果不是则跳转爆炸
   0x08049684 <+64>:    jne    0x804968e <phase_2+74>
   0x08049686 <+66>:    mov    eax,DWORD PTR [ebp-0x28]
   0x08049689 <+69>:    cmp    eax,0x40		# 判断第二个输入数是否为0x40(十进制64)，如果不是则跳转爆炸
   0x0804968c <+72>:    je     0x804969a <phase_2+86>
   0x0804968e <+74>:    call   0x804a071 <explode_bomb>
   0x08049693 <+79>:    mov    eax,0x0
   0x08049698 <+84>:    jmp    0x80496e3 <phase_2+159>
   0x0804969a <+86>:    mov    DWORD PTR [ebp-0x30],0x2		# 将表示循环次数的变量存入[ebp-0x30]中，开始循环，初始值为2（为方便描述设为i，并将8个输入数看做长度为8的数组）
   0x080496a1 <+93>:    jmp    0x80496d8 <phase_2+148>	# 跳转判断循环次数
   0x080496a3 <+95>:    mov    eax,DWORD PTR [ebp-0x30]
   0x080496a6 <+98>:    mov    eax,DWORD PTR [ebp+eax*4-0x2c]
   0x080496aa <+102>:   mov    edx,DWORD PTR [ebp-0x30]
   0x080496ad <+105>:   sub    edx,0x2
   0x080496b0 <+108>:   mov    edx,DWORD PTR [ebp+edx*4-0x2c]
   0x080496b4 <+112>:   mov    ecx,edx
   0x080496b6 <+114>:   sar    ecx,1		# 下标为i-2的元素右移（除以二向下取整）
   0x080496b8 <+116>:   mov    edx,DWORD PTR [ebp-0x30]
   0x080496bb <+119>:   sub    edx,0x1
   0x080496be <+122>:   mov    edx,DWORD PTR [ebp+edx*4-0x2c]
   0x080496c2 <+126>:   add    edx,ecx	# 下标为i-1的元素加上下标的为i-2的元素
   0x080496c4 <+128>:   cmp    eax,edx	# 如果上述结果等于下标为i的元素则继续循环，不等于则爆炸
   0x080496c6 <+130>:   je     0x80496d4 <phase_2+144>
   0x080496c8 <+132>:   call   0x804a071 <explode_bomb>
   0x080496cd <+137>:   mov    eax,0x0
   0x080496d2 <+142>:   jmp    0x80496e3 <phase_2+159>
   0x080496d4 <+144>:   add    DWORD PTR [ebp-0x30],0x1
   0x080496d8 <+148>:   cmp    DWORD PTR [ebp-0x30],0x7		# 如果循环次数变量i大于0x7，则跳出循环，否则继续循环
   0x080496dc <+152>:   jle    0x80496a3 <phase_2+95>
   0x080496de <+154>:   mov    eax,0x1
   0x080496e3 <+159>:   mov    ecx,DWORD PTR [ebp-0xc]
   0x080496e6 <+162>:   xor    ecx,DWORD PTR gs:0x14
   0x080496ed <+169>:   je     0x80496f4 <phase_2+176>
   0x080496ef <+171>:   call   0x8049190 <__stack_chk_fail@plt>
   0x080496f4 <+176>:   leave
   0x080496f5 <+177>:   ret
End of assembler dump.
```

通过分析代码可得，该程序要求输入一组以数 32，64 开头的数，要满足如下关系式

```cpp
array [i]== array [i-1]+ array [i-2]/2;
```

编写程序 C++程序模拟循环获得结果

```cpp
int array [8]={32,64};
for(int i=2;i<8;i++)	{
array [i]= array [i-1]+ array [i-2]/2;
	cout<< array [i]<<" ";
}
```

结果如下
`32 64 80 112 152 208 284 388`

## Phase 3

输入`disassemble phase_3`获取`phase3`的汇编代码：

```avrasm
gdb-peda$ disassemble phase_3
Dump of assembler code for function phase_3:
   0x080496f6 <+0>:     endbr32
   0x080496fa <+4>:     push   ebp
   0x080496fb <+5>:     mov    ebp,esp
   0x080496fd <+7>:     sub    esp,0x38
   0x08049700 <+10>:    mov    eax,DWORD PTR [ebp+0x8]
   0x08049703 <+13>:    mov    DWORD PTR [ebp-0x2c],eax
   0x08049706 <+16>:    mov    eax,gs:0x14
   0x0804970c <+22>:    mov    DWORD PTR [ebp-0xc],eax
   0x0804970f <+25>:    xor    eax,eax
   0x08049711 <+27>:    mov    DWORD PTR [ebp-0x14],0x0
   0x08049718 <+34>:    mov    DWORD PTR [ebp-0x10],0x0
   0x0804971f <+41>:    lea    eax,[ebp-0x18]
   0x08049722 <+44>:    push   eax
   0x08049723 <+45>:    lea    eax,[ebp-0x1c]
   0x08049726 <+48>:    push   eax
   0x08049727 <+49>:    push   0x804b1e8		# sscanf读取的输入格式，查看内容可得%d %d，即输入为两个用空格分开的整数
   0x0804972c <+54>:    push   DWORD PTR [ebp-0x2c]
   0x0804972f <+57>:    call   0x80491f0 <__isoc99_sscanf@plt>
   0x08049734 <+62>:    add    esp,0x10
   0x08049737 <+65>:    mov    DWORD PTR [ebp-0x10],eax
   0x0804973a <+68>:    cmp    DWORD PTR [ebp-0x10],0x1		# 检验是否输入了正确数量的数，如果输入的数小于1个则爆炸，如不是则跳过爆炸，继续运行
   0x0804973e <+72>:    jg     0x804974f <phase_3+89>
   0x08049740 <+74>:    call   0x804a071 <explode_bomb>
   0x08049745 <+79>:    mov    eax,0x0
   0x0804974a <+84>:    jmp    0x80497e5 <phase_3+239>
   0x0804974f <+89>:    mov    eax,DWORD PTR [ebp-0x1c]
   0x08049752 <+92>:    sub    eax,0xcb
   0x08049757 <+97>:    cmp    eax,0x9		# 第一个输入数减去0xcb(十进制203)再与0x9(十进制9)比较，如果大于9则跳转至爆炸行，如不是则继续运行
   0x0804975a <+100>:   ja     0x80497c0 <phase_3+202>
   0x0804975c <+102>:   mov    eax,DWORD PTR [eax*4+0x804b1f0]
   0x08049763 <+109>:   notrack jmp eax		# 根据第一个输入的数减去0xcb的结果选择跳转至不同的分支
# case 0
   0x08049766 <+112>:   mov    DWORD PTR [ebp-0x14],0x3e8	# 给[ebp-0x14]中存入将要与第二个输入比较的数0x3e8
   0x0804976d <+119>:   jmp    0x80497cc <phase_3+214>
# case 1
   0x0804976f <+121>:   mov    DWORD PTR [ebp-0x14],0x3e8	# 给[ebp-0x14]中存入将要与第二个输入比较的数0x3e8
   0x08049776 <+128>:   jmp    0x80497cc <phase_3+214>
# case 2
   0x08049778 <+130>:   mov    DWORD PTR [ebp-0x14],0x14d	# 给[ebp-0x14]中存入将要与第二个输入比较的数0x14d
   0x0804977f <+137>:   jmp    0x80497cc <phase_3+214>
# case3
   0x08049781 <+139>:   mov    DWORD PTR [ebp-0x14],0x3e8	# 给[ebp-0x14]中存入将要与第二个输入比较的数0x3e8
   0x08049788 <+146>:   jmp    0x80497cc <phase_3+214>
# case 4
   0x0804978a <+148>:   mov    DWORD PTR [ebp-0x14],0x14d	# 给[ebp-0x14]中存入将要与第二个输入比较的数0x14d
   0x08049791 <+155>:   jmp    0x80497cc <phase_3+214>
# case 5
   0x08049793 <+157>:   mov    DWORD PTR [ebp-0x14],0x3e8 	# 给[ebp-0x14]中存入将要与第二个输入比较的数0x3e8
   0x0804979a <+164>:   jmp    0x80497cc <phase_3+214>
# case 6
   0x0804979c <+166>:   mov    DWORD PTR [ebp-0x14],0x14d	# 给[ebp-0x14]中存入将要与第二个输入比较的数0x14d
   0x080497a3 <+173>:   jmp    0x80497cc <phase_3+214>
# case 7
   0x080497a5 <+175>:   mov    DWORD PTR [ebp-0x14],0x14d	# 给[ebp-0x14]中存入将要与第二个输入比较的数0x14d
   0x080497ac <+182>:   jmp    0x80497cc <phase_3+214>
# case 8
   0x080497ae <+184>:   mov    DWORD PTR [ebp-0x14],0x3e8	# 给[ebp-0x14]中存入将要与第二个输入比较的数0x3e8
   0x080497b5 <+191>:   jmp    0x80497cc <phase_3+214>
# case 9
   0x080497b7 <+193>:   mov    DWORD PTR [ebp-0x14],0x14d	# 给[ebp-0x14]中存入将要与第二个输入比较的数0x14d
   0x080497be <+200>:   jmp    0x80497cc <phase_3+214>

   0x080497c0 <+202>:   call   0x804a071 <explode_bomb>
   0x080497c5 <+207>:   mov    eax,0x0
   0x080497ca <+212>:   jmp    0x80497e5 <phase_3+239>
   0x080497cc <+214>:   mov    eax,DWORD PTR [ebp-0x18]
   0x080497cf <+217>:   cmp    DWORD PTR [ebp-0x14],eax		# 比较第二个输入与上一步中赋给[ebp-0x14]的值是否相等
   0x080497d2 <+220>:   je     0x80497e0 <phase_3+234>		# 相等则跳转结束，不相等则爆炸
   0x080497d4 <+222>:   call   0x804a071 <explode_bomb>
   0x080497d9 <+227>:   mov    eax,0x0
   0x080497de <+232>:   jmp    0x80497e5 <phase_3+239>
   0x080497e0 <+234>:   mov    eax,0x1
   0x080497e5 <+239>:   mov    edx,DWORD PTR [ebp-0xc]
   0x080497e8 <+242>:   xor    edx,DWORD PTR gs:0x14
   0x080497ef <+249>:   je     0x80497f6 <phase_3+256>
   0x080497f1 <+251>:   call   0x8049190 <__stack_chk_fail@plt>
   0x080497f6 <+256>:   leave
   0x080497f7 <+257>:   ret
End of assembler dump.
```

根据上述分析可得，第一个输入减去`203`不能大于`9`，每种可能的第一个输入对应一种正确的第二个输入，得到下面一组解
`204 1000`

## Phase 4

输入`disassemble phase_4`获取`phase4`的汇编代码:

```shell
gdb-peda$ disassemble phase_4
```

```avrasm
Dump of assembler code for function phase_4:
   0x08049872 <+0>:     endbr32
   0x08049876 <+4>:     push   ebp
   0x08049877 <+5>:     mov    ebp,esp
   0x08049879 <+7>:     sub    esp,0x38
   0x0804987c <+10>:    mov    eax,DWORD PTR [ebp+0x8]
   0x0804987f <+13>:    mov    DWORD PTR [ebp-0x2c],eax
   0x08049882 <+16>:    mov    eax,gs:0x14
   0x08049888 <+22>:    mov    DWORD PTR [ebp-0xc],eax
   0x0804988b <+25>:    xor    eax,eax
   0x0804988d <+27>:    lea    eax,[ebp-0x18]
   0x08049890 <+30>:    push   eax
   0x08049891 <+31>:    lea    eax,[ebp-0x1c]
   0x08049894 <+34>:    push   eax
   0x08049895 <+35>:    push   0x804b1e8		# sscanf读取的输入格式，查看内容可得%d %d，即输入为两个用空格分开的整数
   0x0804989a <+40>:    push   DWORD PTR [ebp-0x2c]
   0x0804989d <+43>:    call   0x80491f0 <__isoc99_sscanf@plt>
   0x080498a2 <+48>:    add    esp,0x10
   0x080498a5 <+51>:    mov    DWORD PTR [ebp-0x14],eax
   0x080498a8 <+54>:    cmp    DWORD PTR [ebp-0x14],0x2		# 检验是否输入了正确数量的数，如果输入的数不是2个则爆炸，如不是则跳过爆炸，继续运行
   0x080498ac <+58>:    jne    0x80498be <phase_4+76>
   0x080498ae <+60>:    mov    eax,DWORD PTR [ebp-0x1c]
   0x080498b1 <+63>:    cmp    eax,0x4
   0x080498b4 <+66>:    jle    0x80498be <phase_4+76>		# 检验第一个输入是否小于等于0x4，如果是则爆炸，如不是则继续运行
   0x080498b6 <+68>:    mov    eax,DWORD PTR [ebp-0x1c]
   0x080498b9 <+71>:    cmp    eax,0x29
   0x080498bc <+74>:    jle    0x80498ca <phase_4+88>		# 检验第一个输入是否小于等于0x29（十进制41），如果不是则爆炸，如是则继续运行
   0x080498be <+76>:    call   0x804a071 <explode_bomb>
   0x080498c3 <+81>:    mov    eax,0x0
   0x080498c8 <+86>:    jmp    0x80498f9 <phase_4+135>
   0x080498ca <+88>:    mov    eax,DWORD PTR [ebp-0x1c]
   0x080498cd <+91>:    sub    esp,0x4
   0x080498d0 <+94>:    push   0x29
   0x080498d2 <+96>:    push   0x5
   0x080498d4 <+98>:    push   eax
   0x080498d5 <+99>:    call   0x80497f8 <func4>				# 传入参数(0x29,0x5,第一个输入)调用func4
   0x080498da <+104>:   add    esp,0x10
   0x080498dd <+107>:   mov    DWORD PTR [ebp-0x10],eax
   0x080498e0 <+110>:   mov    eax,DWORD PTR [ebp-0x18]
   0x080498e3 <+113>:   cmp    DWORD PTR [ebp-0x10],eax		# 判断第二个输入和调用func4后的第一个输入是否相等，相等则拆除，否则爆炸
   0x080498e6 <+116>:   je     0x80498f4 <phase_4+130>
   0x080498e8 <+118>:   call   0x804a071 <explode_bomb>
   0x080498ed <+123>:   mov    eax,0x0
   0x080498f2 <+128>:   jmp    0x80498f9 <phase_4+135>
   0x080498f4 <+130>:   mov    eax,0x1
   0x080498f9 <+135>:   mov    edx,DWORD PTR [ebp-0xc]
   0x080498fc <+138>:   xor    edx,DWORD PTR gs:0x14
   0x08049903 <+145>:   je     0x804990a <phase_4+152>
   0x08049905 <+147>:   call   0x8049190 <__stack_chk_fail@plt>
   0x0804990a <+152>:   leave
   0x0804990b <+153>:   ret
End of assembler dump.
```

利用 gdb 的断点和步进功能，输入一个合法的输入，获取调用完 func4 后内存中该输入的值，此值即为对应的第二个输出，以 6 为例

```shell
# 设置断点
gdb-peda$ b *0x080498e3
Breakpoint 1 at 0x80498e3

# 运行程序
gdb-peda$ r
Starting program: /home/jovyan/work/bomb
Welcome to my fiendish little bomb. You have 7 phases with
which to blow yourself up. Have a nice day!
Well done! You seem to have warmed up!
Phase 1 defused. How about the next one?
That's number 2.  Keep going!
Halfway there!
6 28 # 第一个输入为6，第二个随便输入

# 断点生效
=> 0x80498e3 <phase_4+113>:     cmp    DWORD PTR [ebp-0x10],eax
Breakpoint 1, 0x080498e3 in phase_4 ()

# 此时eax中存储第二个输入，ebp-0x10中存储的为调用过func4的第一个输出，也就是6对应的答案
# 查看ebp-0x10中的内容
gdb-peda$ x/d $ebp-0x10
0xffffd2d8:     27
# 得到一组正确答案 6 27
```

## Phase 5

输入`disassemble phase_5`获取`phase5`的汇编代码：

```shell
gdb-peda$ disassemble phase_5
```

```avrasm
Dump of assembler code for function phase_5:
   0x0804990c <+0>:     endbr32
   0x08049910 <+4>:     push   ebp
   0x08049911 <+5>:     mov    ebp,esp
   0x08049913 <+7>:     sub    esp,0x38
   0x08049916 <+10>:    mov    eax,DWORD PTR [ebp+0x8]
   0x08049919 <+13>:    mov    DWORD PTR [ebp-0x2c],eax
   0x0804991c <+16>:    mov    eax,gs:0x14
   0x08049922 <+22>:    mov    DWORD PTR [ebp-0xc],eax
   0x08049925 <+25>:    xor    eax,eax
   0x08049927 <+27>:    sub    esp,0xc
   0x0804992a <+30>:    push   DWORD PTR [ebp-0x2c]
   0x0804992d <+33>:    call   0x8049dc1 <string_length>	# 调用string_length函数获取输入的字符串长度
   0x08049932 <+38>:    add    esp,0x10
   0x08049935 <+41>:    mov    DWORD PTR [ebp-0x18],eax
   0x08049938 <+44>:    cmp    DWORD PTR [ebp-0x18],0x6		# 如果不是6则爆炸, 是6则跳过爆炸继续运行
   0x0804993c <+48>:    je     0x804994a <phase_5+62>
   0x0804993e <+50>:    call   0x804a071 <explode_bomb>
   0x08049943 <+55>:    mov    eax,0x0
   0x08049948 <+60>:    jmp    0x80499ac <phase_5+160>
   0x0804994a <+62>:    mov    DWORD PTR [ebp-0x1c],0x0		# 遍历字符串中的每一个字符，将当前下标存入[ebp-0x1c]中
   0x08049951 <+69>:    jmp    0x8049979 <phase_5+109>
   0x08049953 <+71>:    mov    edx,DWORD PTR [ebp-0x1c]		# 遍历循环体
   0x08049956 <+74>:    mov    eax,DWORD PTR [ebp-0x2c]
   0x08049959 <+77>:    add    eax,edx
   0x0804995b <+79>:    movzx  eax,BYTE PTR [eax]			# 进行全零扩展并传送，将输入字符串传入eax
   0x0804995e <+82>:    movsx  eax,al							# 进行符号扩展并传送，截取当前下标处的字符传给eax
   0x08049961 <+85>:    and    eax,0xf						# eax中的值和0xf做AND运算，得到的结果存入eax
   0x08049964 <+88>:    movzx  eax,BYTE PTR [eax+0x804d25c]	# 取出0x804d25c中下标为eax的值赋给eax并替换原字符串处的值
   0x0804996b <+95>:    lea    ecx,[ebp-0x13]
   0x0804996e <+98>:    mov    edx,DWORD PTR [ebp-0x1c]
   0x08049971 <+101>:   add    edx,ecx
   0x08049973 <+103>:   mov    BYTE PTR [edx],al
   0x08049975 <+105>:   add    DWORD PTR [ebp-0x1c],0x1		# 下标自增1
   0x08049979 <+109>:   cmp    DWORD PTR [ebp-0x1c],0x5		# 判断遍历是否完成
   0x0804997d <+113>:   jle    0x8049953 <phase_5+71>
   0x0804997f <+115>:   mov    BYTE PTR [ebp-0xd],0x0
   0x08049983 <+119>:   sub    esp,0x8
   0x08049986 <+122>:   push   0x804b218
   0x0804998b <+127>:   lea    eax,[ebp-0x13]
   0x0804998e <+130>:   push   eax
   0x0804998f <+131>:   call   0x8049df1 <strings_not_equal>	# 调用strings_not_equal函数比较两个字符串，在此处打断点即可使用gdb查看得到答案字符串为ckmfia
   0x08049994 <+136>:   add    esp,0x10
   0x08049997 <+139>:   test   eax,eax		# strings_not_equal返回1，两字符串相等，跳过爆炸，否则爆炸
   0x08049999 <+141>:   je     0x80499a7 <phase_5+155>
   0x0804999b <+143>:   call   0x804a071 <explode_bomb>
   0x080499a0 <+148>:   mov    eax,0x0
   0x080499a5 <+153>:   jmp    0x80499ac <phase_5+160>
   0x080499a7 <+155>:   mov    eax,0x1
   0x080499ac <+160>:   mov    ecx,DWORD PTR [ebp-0xc]
   0x080499af <+163>:   xor    ecx,DWORD PTR gs:0x14
   0x080499b6 <+170>:   je     0x80499bd <phase_5+177>
   0x080499b8 <+172>:   call   0x8049190 <__stack_chk_fail@plt>
   0x080499bd <+177>:   leave
   0x080499be <+178>:   ret
End of assembler dump.
```

分析可得，程序需要输入长度为 6 的字符串，字符串中的每个字符的 ASCII 码与 0xf 进行 AND 运算得到的数作为下标，访问字符数组`<array.2712>`中的元素并替换输入字符数组的元素，最终的得到的字符串需要等于 ckmfia。
因此，首先需要查看`<array.2712>`中的元素

```shell
gdb-peda$ x/s 0x804d25c
0x804d25c <array.2712>: "lbmpagdcehnokjif"
```

然后分别找到`ckmfia`在 array 中的位置`（7，12，2，15，14，4）`，现在需要得到能够和`0xf`做`AND`运算产生这些下标的字符，编写 C++程序遍历`0~127`，将符合要求的字符输出，即可得到答案，主函数代码如下:

```cpp
string array_2712="lbmpagdcehnokjif";
int ans_index[]={7,12,2,15,14,4};		// 需要得到的答案下标
for(int i=0;i<6;i++)	{					// 依次搜索每一个下标
    cout<<"Index"<<i<<":";
    for(int j=0;j<128;j++)	{			// 遍历可能的字符
        if((j&15 )== ans_index[i])		// 如果做运算后符合答案则输出
            printf("%c ", j);
        cout<<endl;
    }
}
```

最终得到输出如下

```
Index0:         '       7       G       W       g       w
Index1:
                ,       <       L       \       l       |
Index2:         "       2       B       R       b       r
Index3:         /       ?       O       _       o
Index4:         .       >       N       ^       n       ~
Index5:         $       4       D       T       d       t
```

任取其中一种组合，即可得到正确答案，如
`glbond`

## Phase 6

输入`disassemble phase_6`获取`phase6`的汇编代码:

```shell
gdb-peda$ disassemble phase_6
```

```avrasm
Dump of assembler code for function phase_6:
   0x080499bf <+0>:     endbr32
   0x080499c3 <+4>:     push   ebp
   0x080499c4 <+5>:     mov    ebp,esp
   0x080499c6 <+7>:     sub    esp,0x68
   0x080499c9 <+10>:    mov    eax,DWORD PTR [ebp+0x8]
   0x080499cc <+13>:    mov    DWORD PTR [ebp-0x5c],eax
   0x080499cf <+16>:    mov    eax,gs:0x14
   0x080499d5 <+22>:    mov    DWORD PTR [ebp-0xc],eax
   0x080499d8 <+25>:    xor    eax,eax
   0x080499da <+27>:    mov    DWORD PTR [ebp-0x48],0x804d19c
   0x080499e1 <+34>:    sub    esp,0x4
   0x080499e4 <+37>:    push   0x7		# 读取7个输入的数
   0x080499e6 <+39>:    lea    eax,[ebp-0x44]
   0x080499e9 <+42>:    push   eax
   0x080499ea <+43>:    push   DWORD PTR [ebp-0x5c]
   0x080499ed <+46>:    call   0x8049d2f <read_n_numbers>
   0x080499f2 <+51>:    add    esp,0x10

   0x080499f5 <+54>:    test   eax,eax	# 判断输入的数是否为0，如果是则爆炸
   0x080499f7 <+56>:    jne    0x8049a03 <phase_6+68>
   0x080499f9 <+58>:    mov    eax,0x0
   0x080499fe <+63>:    jmp    0x8049b3a <phase_6+379>

   0x08049a03 <+68>:    mov    DWORD PTR [ebp-0x50],0x0
   0x08049a0a <+75>:    jmp    0x8049a6c <phase_6+173>	# 如果不是0则跳转，继续执行程序

   0x08049a0c <+77>:    mov    eax,DWORD PTR [ebp-0x50]
   0x08049a0f <+80>:    mov    eax,DWORD PTR [ebp+eax*4-0x44]
   0x08049a13 <+84>:    test   eax,eax
   0x08049a15 <+86>:    jle    0x8049a23 <phase_6+100>	# 输入的数是否小于等于0，如果是则跳转爆炸，不是则继续运行

   0x08049a17 <+88>:    mov    eax,DWORD PTR [ebp-0x50]
   0x08049a1a <+91>:    mov    eax,DWORD PTR [ebp+eax*4-0x44]	# 循环遍历输入的数，如果小于等于7则继续，如果大于7则跳转爆炸
   0x08049a1e <+95>:    cmp    eax,0x7
   0x08049a21 <+98>:    jle    0x8049a32 <phase_6+115>
   0x08049a23 <+100>:   call   0x804a071 <explode_bomb>
   0x08049a28 <+105>:   mov    eax,0x0
   0x08049a2d <+110>:   jmp    0x8049b3a <phase_6+379>

   0x08049a32 <+115>:   mov    eax,DWORD PTR [ebp-0x50]
   0x08049a35 <+118>:   add    eax,0x1
   0x08049a38 <+121>:   mov    DWORD PTR [ebp-0x4c],eax
   0x08049a3b <+124>:   jmp    0x8049a62 <phase_6+163>

   0x08049a3d <+126>:   mov    eax,DWORD PTR [ebp-0x50]
   0x08049a40 <+129>:   mov    edx,DWORD PTR [ebp+eax*4-0x44]
   0x08049a44 <+133>:   mov    eax,DWORD PTR [ebp-0x4c]
   0x08049a47 <+136>:   mov    eax,DWORD PTR [ebp+eax*4-0x44]
   0x08049a4b <+140>:   cmp    edx,eax	# 判断当前输入的数是否和已经输入的数重复，如果是则爆炸，如果不是则继续运行
   0x08049a4d <+142>:   jne    0x8049a5e <phase_6+159>
   0x08049a4f <+144>:   call   0x804a071 <explode_bomb>
   0x08049a54 <+149>:   mov    eax,0x0
   0x08049a59 <+154>:   jmp    0x8049b3a <phase_6+379>
   0x08049a5e <+159>:   add    DWORD PTR [ebp-0x4c],0x1

   0x08049a62 <+163>:   cmp    DWORD PTR [ebp-0x4c],0x6		# 判断当前遍历下标是否小于等于6，如果是则继续遍历，如果不是则循环结束
   0x08049a66 <+167>:   jle    0x8049a3d <phase_6+126>
   0x08049a68 <+169>:   add    DWORD PTR [ebp-0x50],0x1
   0x08049a6c <+173>:   cmp    DWORD PTR [ebp-0x50],0x6
   0x08049a70 <+177>:   jle    0x8049a0c <phase_6+77>
   0x08049a72 <+179>:   mov    DWORD PTR [ebp-0x50],0x0
   0x08049a79 <+186>:   jmp    0x8049ab1 <phase_6+242>
   0x08049a7b <+188>:   mov    eax,DWORD PTR [ebp-0x48]
   0x08049a7e <+191>:   mov    DWORD PTR [ebp-0x54],eax
   0x08049a81 <+194>:   mov    DWORD PTR [ebp-0x4c],0x1
   0x08049a88 <+201>:   jmp    0x8049a97 <phase_6+216>
   0x08049a8a <+203>:   mov    eax,DWORD PTR [ebp-0x54]
   0x08049a8d <+206>:   mov    eax,DWORD PTR [eax+0x8]
   0x08049a90 <+209>:   mov    DWORD PTR [ebp-0x54],eax
   0x08049a93 <+212>:   add    DWORD PTR [ebp-0x4c],0x1
   0x08049a97 <+216>:   mov    eax,DWORD PTR [ebp-0x50]
   0x08049a9a <+219>:   mov    eax,DWORD PTR [ebp+eax*4-0x44]
   0x08049a9e <+223>:   cmp    DWORD PTR [ebp-0x4c],eax
   0x08049aa1 <+226>:   jl     0x8049a8a <phase_6+203>
   0x08049aa3 <+228>:   mov    eax,DWORD PTR [ebp-0x50]
   0x08049aa6 <+231>:   mov    edx,DWORD PTR [ebp-0x54]
   0x08049aa9 <+234>:   mov    DWORD PTR [ebp+eax*4-0x28],edx
   0x08049aad <+238>:   add    DWORD PTR [ebp-0x50],0x1
   0x08049ab1 <+242>:   cmp    DWORD PTR [ebp-0x50],0x6
   0x08049ab5 <+246>:   jle    0x8049a7b <phase_6+188>
   0x08049ab7 <+248>:   mov    eax,DWORD PTR [ebp-0x28]
   0x08049aba <+251>:   mov    DWORD PTR [ebp-0x48],eax
   0x08049abd <+254>:   mov    eax,DWORD PTR [ebp-0x48]
   0x08049ac0 <+257>:   mov    DWORD PTR [ebp-0x54],eax
   0x08049ac3 <+260>:   mov    DWORD PTR [ebp-0x50],0x1
   0x08049aca <+267>:   jmp    0x8049ae6 <phase_6+295>
   0x08049acc <+269>:   mov    eax,DWORD PTR [ebp-0x50]
   0x08049acf <+272>:   mov    edx,DWORD PTR [ebp+eax*4-0x28]
   0x08049ad3 <+276>:   mov    eax,DWORD PTR [ebp-0x54]
   0x08049ad6 <+279>:   mov    DWORD PTR [eax+0x8],edx
   0x08049ad9 <+282>:   mov    eax,DWORD PTR [ebp-0x54]
   0x08049adc <+285>:   mov    eax,DWORD PTR [eax+0x8]
   0x08049adf <+288>:   mov    DWORD PTR [ebp-0x54],eax
   0x08049ae2 <+291>:   add    DWORD PTR [ebp-0x50],0x1
   0x08049ae6 <+295>:   cmp    DWORD PTR [ebp-0x50],0x6
   0x08049aea <+299>:   jle    0x8049acc <phase_6+269>
   0x08049aec <+301>:   mov    eax,DWORD PTR [ebp-0x54]
   0x08049aef <+304>:   mov    DWORD PTR [eax+0x8],0x0
   0x08049af6 <+311>:   mov    eax,DWORD PTR [ebp-0x48]
   0x08049af9 <+314>:   mov    DWORD PTR [ebp-0x54],eax
   0x08049afc <+317>:   mov    DWORD PTR [ebp-0x50],0x0
   0x08049b03 <+324>:   jmp    0x8049b2f <phase_6+368>
   0x08049b05 <+326>:   mov    eax,DWORD PTR [ebp-0x54]
   0x08049b08 <+329>:   mov    edx,DWORD PTR [eax]
   0x08049b0a <+331>:   mov    eax,DWORD PTR [ebp-0x54]
   0x08049b0d <+334>:   mov    eax,DWORD PTR [eax+0x8]
   0x08049b10 <+337>:   mov    eax,DWORD PTR [eax]
   0x08049b12 <+339>:   cmp    edx,eax
   0x08049b14 <+341>:   jle    0x8049b22 <phase_6+355>
   0x08049b16 <+343>:   call   0x804a071 <explode_bomb>
   0x08049b1b <+348>:   mov    eax,0x0
   0x08049b20 <+353>:   jmp    0x8049b3a <phase_6+379>
   0x08049b22 <+355>:   mov    eax,DWORD PTR [ebp-0x54]
   0x08049b25 <+358>:   mov    eax,DWORD PTR [eax+0x8]
   0x08049b28 <+361>:   mov    DWORD PTR [ebp-0x54],eax
   0x08049b2b <+364>:   add    DWORD PTR [ebp-0x50],0x1
   0x08049b2f <+368>:   cmp    DWORD PTR [ebp-0x50],0x5
   0x08049b33 <+372>:   jle    0x8049b05 <phase_6+326>
   0x08049b35 <+374>:   mov    eax,0x1
   0x08049b3a <+379>:   mov    ecx,DWORD PTR [ebp-0xc]
   0x08049b3d <+382>:   xor    ecx,DWORD PTR gs:0x14
   0x08049b44 <+389>:   je     0x8049b4b <phase_6+396>
   0x08049b46 <+391>:   call   0x8049190 <__stack_chk_fail@plt>
   0x08049b4b <+396>:   leave
   0x08049b4c <+397>:   ret
End of assembler dump.
```

根据分析可得，答案由 1~7 组成且不能重复，编写 C++程序生成所有可能的输入（1~7 的全排列），记录其对应的输出，并且依次检索输出，找到有拆弹成功提示语句的输出，其对应输入即为答案，代码及思路如下：
首先编写`gen.cpp`，负责在`input`文件夹中生成输入文件，并按序号命名，代码如下；

```cpp
#include<iostream>
#include<algorithm>
#include<fstream>
#include<sstream>
using namespace std;
int main()
{
	// 记录之前节点的答案
    string prev_phase[7]={
        "Why index with the middle bits?\n",
        "-864026624 1103103214\n",
        "32 64 80 112 152 208 284 388\n",
        "204 1000\n",
        "6 27\n",
        "glbond\n",
        "1 2 3 4 5 6 7 "
    };

    string str="1234567",filename;
    stringstream m_sstream;	// 使用字符串流实现整数和字符串的转化，方便按序号命名文件
ofstream f;				// 使用文件输出流将答案存放进txt中

int total=0;				// 表示序号，用以记录区分不同的输入
// 使用algorithm中的函数对1234567进行全排列，将每次排列按空格分开记录入答案
    while(next_permutation(str.begin(),str.end()))
    {
        total++;

        for(int i=0;i<7;i++)
        {
            prev_phase[6][i*2]=str[i];	// 将重新排列的str中数字赋值给记录答案的字符串数组
        }

        // gen file
        m_sstream.clear();
        m_sstream<<"./input/"<<total;		// 指定文件路径和文件名
        m_sstream>>filename;
        cout<<filename<<".txt\n";
        f.open(filename+".txt",ios::out);

        for (int i = 0; i < 7; i++)
        {
            f<<prev_phase[i];
        }
        f<<"\n";
        f.close();
}

cout<<total;		// 获得全排列数
}
```

编译运行后，即可在当前目录下得到`input`文件夹和全排列数`5039`，随后编写`scaner.cpp`用于检索答案，代码如下：

```cpp
#include<iostream>
#include<algorithm>
#include<fstream>
#include<sstream>
using namespace std;
int main()
{
    string str="1234567",filename;
    stringstream m_sstream;		//
    ifstream f;
    string right_file_name="none";
    bool isRightAns;

    int total=0;
    while(total<=5039)
    {
        total++;

        isRightAns=true;			// 当前输出为正确输出的真值

        // open file
        m_sstream.clear();
        m_sstream<<"./Output/Output"<<total;
        m_sstream>>filename;
        f.open(filename+".txt",ios::in);		// 打开Output文件夹内名为Output[序号].txt的文本文件，如Output25.txt

        while (!f.eof())
        {
            getline(f, str); 			// 逐行读取文本
            if(str=="BOOM!!!")	// 如果检索到拆除phase_6爆炸的语句，则不是正确输出，将isRightAns真值设为0
            {
                isRightAns=false;
            }
            if(isRightAns)		//如果没有提示爆炸，表示拆除成功，则输出当前输出记录文本的文件名，程序结束
            {
                right_file_name=filename;
                cout<<right_file_name<<endl;
                exit(0);
            }
        }
        f.close();
    }
    cout<<right_file_name;	// Debug 备用输出语句
}
```

上述代码编写完成后，已经可以自动生成输入和检索输出了，接下来需要编写 shell 脚本生成`input`文件，自动执行`bomb`文件，将每一个`input`带入运行，得到并记录对应的`Output`，再对`Output`进行检索即可得到正确答案。将`scaner.cpp`和 g`en.cpp`打包为`tools.tar.gz`，编写的 shell 脚本`run.sh`，代码如下：

```sh
#!/bin/bash
echo "Welcome,running...."
echo "Exacting tools"
tar -zxvf ./tools.tar.gz					# 解压cpp文件
cp ./tools/gen.cpp ./gen.cpp
cp ./tools/scaner.cpp ./scaner.cpp
g++ ./gen.cpp -o ./gen					# 编译input生成器gen.cpp
g++ ./scaner.cpp -o ./scanner				# 编译Output检索器scaner.cpp
chmod +x ./gen								# 赋予可执行文件权限
chmod +x ./scanner
chmod +x ./bomb
mkdir input								# 创建存放input的文件夹
echo "Generating Inputs"
./gen										# 执行生成器生成所有输出
mkdir ./Output								# 创建存放输出的文件夹
for((i=1;i<=5039;i++)) 					# 循环带入每一种输入
do
echo "running",$(expr $i)
./bomb ./input/${i}.txt > ./Output/Output${i}.txt  #将输出结构存入Output中
done
echo "Create Complete!"
echo "Finding ans..."
./scanner									# 执行检索器寻找正确答案
echo "Done."								# 完成
```

将`tools.tar.gz`和`run.sh`上传至`~/work`目录中执行脚本

```shell
(base) jovyan@b5ea96d0ec9c:~/work$ chmod +x ./run.sh
(base) jovyan@b5ea96d0ec9c: ~/work$ ./run.sh
```

最终得到如下输出

```
./Output/Output3078
Done.
```

查看对应 input3078 的内容即可得到答案

```shell
(base) jovyan@b5ea96d0ec9c: ~/work$ vim ./input/3078.txt

Why index with the middle bits?
-864026624 1103103214
32 64 80 112 152 208 284 388
204 1000
6 27
glbond
5 2 6 3 1 4 7
~
~

"./input/3078.txt"				7L,119C                                                               1,1           All
```

因此正确答案为
`5 2 6 3 1 4 7`

## Phase 7 隐藏关

```shell
gdb-peda$ disassemble secret_phase
```

```avrasm
Dump of assembler code for function secret_phase:
   0x08049bb4 <+0>:     endbr32
   0x08049bb8 <+4>:     push   ebp
   0x08049bb9 <+5>:     mov    ebp,esp
   0x08049bbb <+7>:     sub    esp,0x18
   0x08049bbe <+10>:    call   0x8049f2a <read_line>
   0x08049bc3 <+15>:    mov    DWORD PTR [ebp-0x14],eax
   0x08049bc6 <+18>:    sub    esp,0xc
   0x08049bc9 <+21>:    push   DWORD PTR [ebp-0x14]
   0x08049bcc <+24>:    call   0x8049220 <atoi@plt>
   0x08049bd1 <+29>:    add    esp,0x10
   0x08049bd4 <+32>:    mov    DWORD PTR [ebp-0x10],eax
   0x08049bd7 <+35>:    cmp    DWORD PTR [ebp-0x10],0x0
   0x08049bdb <+39>:    jle    0x8049be6 <secret_phase+50>
   0x08049bdd <+41>:    cmp    DWORD PTR [ebp-0x10],0x3e9
   0x08049be4 <+48>:    jle    0x8049bf2 <secret_phase+62>
   0x08049be6 <+50>:    call   0x804a071 <explode_bomb>
   0x08049beb <+55>:    mov    eax,0x0
   0x08049bf0 <+60>:    jmp    0x8049c34 <secret_phase+128>
   0x08049bf2 <+62>:    sub    esp,0x8
   0x08049bf5 <+65>:    push   DWORD PTR [ebp-0x10]
   0x08049bf8 <+68>:    push   0x804d250		# 查看地址得到<n1>:36
   0x08049bfd <+73>:    call   0x8049b4d <fun7>	# 调用fun7
   0x08049c02 <+78>:    add    esp,0x10
   0x08049c05 <+81>:    mov    DWORD PTR [ebp-0xc],eax
   0x08049c08 <+84>:    cmp    DWORD PTR [ebp-0xc],0x3	# 判断返回值是否为0x3
   0x08049c0c <+88>:    je     0x8049c1a <secret_phase+102>		# 是3则跳过爆炸，否则爆炸
   0x08049c0e <+90>:    call   0x804a071 <explode_bomb>
   0x08049c13 <+95>:    mov    eax,0x0
   0x08049c18 <+100>:   jmp    0x8049c34 <secret_phase+128>
   0x08049c1a <+102>:   sub    esp,0xc
   0x08049c1d <+105>:   push   0x804b220		# 查询内容为87
   0x08049c22 <+110>:   call   0x80491b0 <puts@plt>
   0x08049c27 <+115>:   add    esp,0x10
   0x08049c2a <+118>:   call   0x804a09e <phase_defused>
   0x08049c2f <+123>:   mov    eax,0x1
   0x08049c34 <+128>:   leave
   0x08049c35 <+129>:   ret
End of assembler dump.

gdb-peda$ disassemble phase_defused
Dump of assembler code for function phase_defused:
   0x0804a09e <+0>:     endbr32
   0x0804a0a2 <+4>:     push   ebp
   0x0804a0a3 <+5>:     mov    ebp,esp
   0x0804a0a5 <+7>:     sub    esp,0x68
   0x0804a0a8 <+10>:    mov    eax,gs:0x14
   0x0804a0ae <+16>:    mov    DWORD PTR [ebp-0xc],eax
   0x0804a0b1 <+19>:    xor    eax,eax
   0x0804a0b3 <+21>:    mov    eax,ds:0x804d28c
   0x0804a0b8 <+26>:    cmp    eax,0x7
   0x0804a0bb <+29>:    jne    0x804a134 <phase_defused+150>
   0x0804a0bd <+31>:    sub    esp,0xc
   0x0804a0c0 <+34>:    lea    eax,[ebp-0x5c]
   0x0804a0c3 <+37>:    push   eax
   0x0804a0c4 <+38>:    lea    eax,[ebp-0x64]
   0x0804a0c7 <+41>:    push   eax
   0x0804a0c8 <+42>:    lea    eax,[ebp-0x68]
   0x0804a0cb <+45>:    push   eax
   0x0804a0cc <+46>:    push   0x804b31e		# "%d %d %s"
   0x0804a0d1 <+51>:    push   0x804d3e0
   0x0804a0d6 <+56>:    call   0x80491f0 <__isoc99_sscanf@plt>
   0x0804a0db <+61>:    add    esp,0x20
   0x0804a0de <+64>:    mov    DWORD PTR [ebp-0x60],eax
   0x0804a0e1 <+67>:    cmp    DWORD PTR [ebp-0x60],0x3
   0x0804a0e5 <+71>:    jne    0x804a124 <phase_defused+134>
   0x0804a0e7 <+73>:    sub    esp,0x8
   0x0804a0ea <+76>:    push   0x804b327		# 内容为 "bcLjEp"
   0x0804a0ef <+81>:    lea    eax,[ebp-0x5c]
   0x0804a0f2 <+84>:    push   eax
   0x0804a0f3 <+85>:    call   0x8049df1 <strings_not_equal>
   0x0804a0f8 <+90>:    add    esp,0x10
   0x0804a0fb <+93>:    test   eax,eax
   0x0804a0fd <+95>:    jne    0x804a124 <phase_defused+134>
   0x0804a0ff <+97>:    sub    esp,0xc
   0x0804a102 <+100>:   push   0x804b330
   0x0804a107 <+105>:   call   0x80491b0 <puts@plt>
   0x0804a10c <+110>:   add    esp,0x10
   0x0804a10f <+113>:   sub    esp,0xc
   0x0804a112 <+116>:   push   0x804b358
   0x0804a117 <+121>:   call   0x80491b0 <puts@plt>
   0x0804a11c <+126>:   add    esp,0x10
   0x0804a11f <+129>:   call   0x8049bb4 <secret_phase>
   0x0804a124 <+134>:   sub    esp,0xc
   0x0804a127 <+137>:   push   0x804b390
   0x0804a12c <+142>:   call   0x80491b0 <puts@plt>
   0x0804a131 <+147>:   add    esp,0x10
   0x0804a134 <+150>:   nop
   0x0804a135 <+151>:   mov    eax,DWORD PTR [ebp-0xc]
   0x0804a138 <+154>:   xor    eax,DWORD PTR gs:0x14
   0x0804a13f <+161>:   je     0x804a146 <phase_defused+168>
   0x0804a141 <+163>:   call   0x8049190 <__stack_chk_fail@plt>
   0x0804a146 <+168>:   leave
   0x0804a147 <+169>:   ret
End of assembler dump.
```

根据查询内容推断可得，在 phase4 答案后输入 bcLjEp，即可打开隐藏关入口，随后分析 fun7

```avrasm
gdb-peda$ disassemble fun7
Dump of assembler code for function fun7:
   0x08049b4d <+0>:     endbr32
   0x08049b51 <+4>:     push   ebp
   0x08049b52 <+5>:     mov    ebp,esp
   0x08049b54 <+7>:     sub    esp,0x8
   0x08049b57 <+10>:    cmp    DWORD PTR [ebp+0x8],0x0
   0x08049b5b <+14>:    jne    0x8049b64 <fun7+23>
   0x08049b5d <+16>:    mov    eax,0xffffffff
   0x08049b62 <+21>:    jmp    0x8049bb2 <fun7+101>
   0x08049b64 <+23>:    mov    eax,DWORD PTR [ebp+0x8]
   0x08049b67 <+26>:    mov    eax,DWORD PTR [eax]
   0x08049b69 <+28>:    cmp    DWORD PTR [ebp+0xc],eax
   0x08049b6c <+31>:    jge    0x8049b87 <fun7+58>
   0x08049b6e <+33>:    mov    eax,DWORD PTR [ebp+0x8]
   0x08049b71 <+36>:    mov    eax,DWORD PTR [eax+0x4]
   0x08049b74 <+39>:    sub    esp,0x8
   0x08049b77 <+42>:    push   DWORD PTR [ebp+0xc]
   0x08049b7a <+45>:    push   eax
   0x08049b7b <+46>:    call   0x8049b4d <fun7>	# 递归调用fun7（eax，ebp+0xc）
   0x08049b80 <+51>:    add    esp,0x10
   0x08049b83 <+54>:    add    eax,eax
   0x08049b85 <+56>:    jmp    0x8049bb2 <fun7+101>
   0x08049b87 <+58>:    mov    eax,DWORD PTR [ebp+0x8]
   0x08049b8a <+61>:    mov    eax,DWORD PTR [eax]
   0x08049b8c <+63>:    cmp    DWORD PTR [ebp+0xc],eax
   0x08049b8f <+66>:    jne    0x8049b98 <fun7+75>
   0x08049b91 <+68>:    mov    eax,0x0
   0x08049b96 <+73>:    jmp    0x8049bb2 <fun7+101>
   0x08049b98 <+75>:    mov    eax,DWORD PTR [ebp+0x8]
   0x08049b9b <+78>:    mov    eax,DWORD PTR [eax+0x8]
   0x08049b9e <+81>:    sub    esp,0x8
   0x08049ba1 <+84>:    push   DWORD PTR [ebp+0xc]
   0x08049ba4 <+87>:    push   eax
   0x08049ba5 <+88>:    call   0x8049b4d <fun7>
   0x08049baa <+93>:    add    esp,0x10
   0x08049bad <+96>:    add    eax,eax
   0x08049baf <+98>:    add    eax,0x1
   0x08049bb2 <+101>:   leave
   0x08049bb3 <+102>:   ret
End of assembler dump.
```

编写以下代码模拟功能：

```cpp
int fun7(int input_1, int input_2)
{
    if (&input_1==NULL)
       return -1;
int ret=0;
if (input_1-input_2>0)
{
          ret=fun7(*(&input_1+4), input_2);
ret*=2
}
    else if(input_1- input_2==0)
return 0;
else
{
ret=fun7(*(&input_1+8),input_2);
ret*=2+1;
}
return ret;
}
```

得到结果
`107`

# ~~一键拆弹~~方法

> 项目地址:
> https://github.com/LinYuanChan/bomblab-auto-defuse

## 注意

**此方法仅供学习交流使用, 不要用于正式评测及学术欺诈等不正当用途**

## 实现方法

使用过程中发现, 提交评测时测试程序会检索`bomb`的输出,每得到一个正确的输出增加 10 分,因此只需要编写新的`bomb`,输出所有得分语句,并且替换即可~~一键拆弹~~

```cpp
#include<iostream>
#include <stdio.h>
#include <stdlib.h>

using namespace std;

char* read_line()
{
    return "001";
}

FILE *infile;
int main(int argc, char *argv[])
{


	infile = stdin;


    char *input;

    /* Note to self: remember to port this bomb to Windows and put a
     * fantastic GUI on it. */

    /* When run with no arguments, the bomb reads its input lines
     * from standard input. */
    if (argc == 1) {
	infile = stdin;
    }

    /* When run with one argument <file>, the bomb reads from <file>
     * until EOF, and then switches to standard input. Thus, as you
     * defuse each phase, you can add its defusing string to <file> and
     * avoid having to retype it. */
    else if (argc == 2) {
	if (!(infile = fopen(argv[1], "r"))) {
	    printf("%s: Error: Couldn't open %s\n", argv[0], argv[1]);
	    exit(8);
	}
    }

    /* You can't call the bomb with more than 1 command line argument. */
    else {
	printf("Usage: %s [<input_file>]\n", argv[0]);
	exit(8);
    }

    /* Do all sorts of secret stuff that makes the bomb harder to defuse. */
    //initialize_bomb();

    printf("Welcome to my fiendish little bomb. You have 7 phases with\n");
    printf("which to blow yourself up. Have a nice day!\n");

    /* Warm up phase! */
    input = read_line();             /* Get input                   */
    // if( phase_0(input) ) {           /* Run the phase               */
    //     phase_defused();             /* Drat!  They figured it out! */
        printf("Well done! You seem to have warmed up!\n");
	// }

    /* Hmm...  Six phases must be more secure than one phase! */
    input = read_line();             /* Get input                   */
    // if( phase_1(input) ) {           /* Run the phase               */
        // phase_defused();             /* Drat!  They figured it out! Let me know how they did it. */
        printf("Phase 1 defused. How about the next one?\n");
	// }

    /* The second phase is harder.  No one will ever figure out
     * how to defuse this... */
    input = read_line();
    // if( phase_2(input) ) {
        // phase_defused();
        printf("That's number 2.  Keep going!\n");
	// }

    /* I guess this is too easy so far.  Some more complex code will
     * confuse people. */
    input = read_line();
    // if( phase_3(input) ) {
        // phase_defused();
        printf("Halfway there!\n");
	// }

    /* Oh yeah?  Well, how good is your math?  Try on this saucy problem! */
    input = read_line();
    // if( phase_4(input) ) {
        // phase_defused();
        printf("So you got that one.  Try this one.\n");
	// }

    /* Round and 'round in memory we go, where we stop, the bomb blows! */
    input = read_line();
    // if( phase_5(input) ) {
        // phase_defused();
        printf("Good work!  On to the next...\nCurses, you've found the secret phase!\nBut finding it and solving it are quite different...\n");
	// }

    /* This phase will never be used, since no one will get past the
     * earlier ones.  But just in case, make this one extra hard. */
    input = read_line();
    // if( phase_6(input) ) {
        // phase_defused();
        printf("Wow! You've defused the secret stage!\nCongratulations! You've defused the bomb!");
	// }

    /* Wow, they got it!  But isn't something... missing?  Perhaps
     * something they overlooked?  Mua ha ha ha ha! */

    return 0;
// return 0;
}
```

为了达到~~**真 一键拆弹**~~的效果, 再编写一个 shell 脚本,自动执行编译和替换文件

```shell
#!/bin/bash
cd ~
git clone git@github.com:LinYuanChan/bomblab-auto-defuse.git
mv ./bomblab-auto-defuse/auto_defuse.sh ./auto_defuse.sh
chmod +x auto_defuse.sh
./auto_defuse.sh
```

完成后执行脚本即可
