package gocdp

import (
	"errors"
	"fmt"
	"io"
	"os"
)

var c *CDP
var errNoParser = errors.New("no parser found")
var errNoTrimmer = errors.New("no trimmer found")

var defaultParsers = []Parser{
	FfufParser{},
	GobusterParser{},
	DirbParser{},
}

var defaultTrimmers = []Trimmer{
	FfufParser{},
}

type Option func(*CDP)

// FailNoParserErrs will enable failing when no parser is found when parsing multiple files
func FailNoParserErrs() Option {
	return func(c *CDP) {
		c.failNoParserErr = true
	}
}

// FailNoTrimmerErrs will enable failing when no trimmer is found when trimming multiple files
func FailNoTrimmerErrs() Option {
	return func(c *CDP) {
		c.failNoTrimmerErr = true
	}
}

// DefaultParsers sets the default parsers used when no parser is specified
func DefaultParsers(parsers ...Parser) Option {
	return func(c *CDP) {
		c.defaultParsers = parsers
	}
}

// DefaultTrimmers sets the default trimmers used when no trimmer is specified
func DefaultTrimmers(trimmers ...Trimmer) Option {
	return func(c *CDP) {
		c.defaultTrimmers = trimmers
	}
}

type CDP struct {
	defaultParsers   []Parser
	defaultTrimmers  []Trimmer
	failNoParserErr  bool
	failNoTrimmerErr bool
}

func New(options ...Option) *CDP {
	cdp := &CDP{}
	for _, option := range options {
		option(cdp)
	}

	if len(cdp.defaultParsers) == 0 {
		cdp.defaultParsers = defaultParsers
	}

	if len(cdp.defaultTrimmers) == 0 {
		cdp.defaultTrimmers = defaultTrimmers
	}
	return cdp
}

func (cdp *CDP) SmartParseFiles(files []string, parsers ...Parser) (CDResults, error) {
	var allResults CDResults
	for _, file := range files {
		results, err := cdp.SmartParseFile(file, parsers...)
		if err != nil {
			if err == errNoParser {
				if cdp.failNoParserErr {
					return nil, fmt.Errorf("no parser found for file '%s'", file)
				}
				continue
			}
			return nil, err
		}

		allResults = append(allResults, results...)
	}
	return allResults, nil
}

func (cdp *CDP) SmartParseFile(file string, parsers ...Parser) (CDResults, error) {
	f, err := os.Open(file)
	if err != nil {
		return nil, err
	}
	defer f.Close()

	return cdp.SmartParse(f, parsers...)
}

func (cdp *CDP) SmartParse(reader io.Reader, parsers ...Parser) (CDResults, error) {
	bytes, err := io.ReadAll(reader)
	if err != nil {
		return nil, err
	}

	if len(parsers) == 0 {
		parsers = cdp.defaultParsers
	}

	input := string(bytes)
	var parser Parser
	for _, p := range parsers {
		if p.CanParse(input) {
			parser = p
			break
		}
	}

	if parser == nil {
		return nil, errNoParser
	}

	output, err := parser.Parse(input)
	if err != nil {
		return nil, err
	}
	return output, nil
}

func SmartParseFiles(files []string, parsers ...Parser) (CDResults, error) {
	return c.SmartParseFiles(files, parsers...)
}

func SmartParseFile(file string, parsers ...Parser) (CDResults, error) {
	return c.SmartParseFile(file, parsers...)
}

func SmartParse(reader io.Reader, parsers ...Parser) (CDResults, error) {
	return c.SmartParse(reader, parsers...)
}

func (cdp *CDP) SmartTrimFiles(files []string, opts []TrimOption, trimmers ...Trimmer) error {
	for _, file := range files {
		err := cdp.SmartTrimFile(file, opts, trimmers...)
		if err != nil {
			if err == errNoTrimmer {
				if cdp.failNoTrimmerErr {
					return fmt.Errorf("no trimmer found for file '%s'", file)
				}
				continue
			}
			return err
		}
	}
	return nil
}

func (cdp *CDP) SmartTrimFile(file string, opts []TrimOption, trimmers ...Trimmer) error {
	f, err := os.Open(file)
	if err != nil {
		return err
	}

	output, err := cdp.SmartTrim(f, opts, trimmers...)
	if err != nil {
		return err
	}

	err = f.Close()
	if err != nil {
		return err
	}

	return os.WriteFile(file, []byte(output), 0644)
}

func (cdp *CDP) SmartTrim(reader io.Reader, opts []TrimOption, trimmers ...Trimmer) (string, error) {
	bytes, err := io.ReadAll(reader)
	if err != nil {
		return "", err
	}

	if len(trimmers) == 0 {
		trimmers = cdp.defaultTrimmers
	}

	input := string(bytes)
	var trimmer Trimmer
	for _, t := range trimmers {
		if t.CanTrim(input) {
			trimmer = t
			break
		}
	}

	if trimmer == nil {
		return "", errNoTrimmer
	}

	output, err := trimmer.Trim(input, opts...)
	if err != nil {
		return "", err
	}
	return output, nil
}

func SmartTrimFiles(files []string, opts []TrimOption, trimmers ...Trimmer) error {
	return c.SmartTrimFiles(files, opts, trimmers...)
}

func SmartTrimFile(file string, opts []TrimOption, trimmers ...Trimmer) error {
	return c.SmartTrimFile(file, opts, trimmers...)
}

func SmartTrim(reader io.Reader, opts []TrimOption, trimmers ...Trimmer) (string, error) {
	return c.SmartTrim(reader, opts, trimmers...)
}

func init() {
	c = New()
}
