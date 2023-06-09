package cmd

import (
	"bufio"
	"fmt"
	"os"

	"github.com/NoF0rte/gocdp"
	"github.com/jedib0t/go-pretty/v6/table"
	"github.com/spf13/cobra"
)

// totalsCmd represents the totals command
var totalsCmd = &cobra.Command{
	Use:   "totals files...",
	Args:  cobra.MinimumNArgs(1),
	Short: "Display status code result totals",
	RunE: func(cmd *cobra.Command, args []string) error {
		var files []string
		for _, arg := range args {
			if arg == "-" {
				scanner := bufio.NewScanner(os.Stdin)
				for scanner.Scan() {
					files = append(files, scanner.Text())
				}
			} else {
				files = append(files, arg)
			}
		}

		byFile, _ := cmd.Flags().GetBool("by-file")
		if byFile {
			for _, file := range files {
				results, err := gocdp.SmartParseFiles([]string{file})
				if err != nil {
					return err
				}

				fmt.Printf("File: %s\n", file)
				displayTotalsTable(results.GroupByStatus())
				fmt.Println()
			}
		} else {
			results, err := gocdp.SmartParseFiles(files)
			if err != nil {
				return err
			}

			displayTotalsTable(results.GroupByStatus())
		}

		return nil
	},
}

func displayTotalsTable(grouped map[int][]gocdp.CDResult) {
	writer := table.NewWriter()
	writer.AppendHeader(table.Row{"Status", "Total"})

	for status, results := range grouped {
		writer.AppendRow(table.Row{
			status,
			len(results),
		})
	}

	fmt.Println(writer.Render())
}

func init() {
	rootCmd.AddCommand(totalsCmd)
	totalsCmd.Flags().Bool("by-file", false, "Show totals for each file")
}
